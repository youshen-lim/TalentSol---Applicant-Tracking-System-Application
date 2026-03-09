import express, { Response, Request } from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Lazy-load Stripe so the backend starts without STRIPE_SECRET_KEY in dev
async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new AppError('Stripe is not configured — set STRIPE_SECRET_KEY', 503);
  const { default: Stripe } = await import('stripe');
  return new (Stripe as any)(key) as any;
}

const PRICE_IDS = {
  starter:    process.env.STRIPE_PRICE_STARTER    || '',
  growth:     process.env.STRIPE_PRICE_GROWTH     || '',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
} as const;

// All billing routes require authentication
router.use(authenticateToken);

// GET /api/billing/subscription — current plan + usage
router.get('/subscription', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: {
      plan: true,
      planStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      stripeSubscriptionId: true,
    },
  });

  if (!company) throw new AppError('Company not found', 404);

  const [jobCount, userCount] = await Promise.all([
    prisma.job.count({ where: { companyId: req.user!.companyId, status: 'open' } }),
    prisma.user.count({ where: { companyId: req.user!.companyId } }),
  ]);

  res.json({
    success: true,
    data: {
      plan: company.plan,
      planStatus: company.planStatus,
      trialEndsAt: company.trialEndsAt,
      currentPeriodEnd: company.currentPeriodEnd,
      usage: {
        jobs: jobCount,
        users: userCount,
      },
    },
  });
}));

// POST /api/billing/create-checkout — create Stripe Checkout session
router.post('/create-checkout', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { plan } = req.body as { plan: 'starter' | 'growth' | 'enterprise' };
  if (!plan || !PRICE_IDS[plan]) throw new AppError('Invalid plan selected', 400);

  const stripe = await getStripe();

  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: { stripeCustomerId: true, name: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    customer: company?.stripeCustomerId || undefined,
    customer_email: company?.stripeCustomerId ? undefined : req.user!.email,
    metadata: { companyId: req.user!.companyId, plan },
    success_url: `${process.env.APP_URL || 'http://localhost:5173'}/settings?tab=billing&success=1`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/settings?tab=billing`,
  });

  res.json({ success: true, data: { url: session.url } });
}));

// POST /api/billing/create-portal — Stripe Customer Portal
router.post('/create-portal', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stripe = await getStripe();

  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId },
    select: { stripeCustomerId: true },
  });

  if (!company?.stripeCustomerId) throw new AppError('No Stripe customer found', 404);

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${process.env.APP_URL || 'http://localhost:5173'}/settings?tab=billing`,
  });

  res.json({ success: true, data: { url: session.url } });
}));

// POST /api/billing/webhook — Stripe webhook (no auth, raw body required)
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      res.status(503).json({ error: 'Webhook secret not configured' });
      return;
    }

    let event: any;
    try {
      const stripe = await getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      res.status(400).json({ error: 'Webhook signature invalid' });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const { companyId, plan } = session.metadata ?? {};
          if (companyId) {
            await prisma.company.update({
              where: { id: companyId },
              data: {
                plan: plan || 'starter',
                planStatus: 'active',
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
              },
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const sub = invoice.subscription;
          if (sub) {
            const stripeClient = await getStripe();
            const subscription: any = await stripeClient.subscriptions.retrieve(sub);
            const company = await prisma.company.findFirst({
              where: { stripeSubscriptionId: sub },
            });
            if (company) {
              await prisma.company.update({
                where: { id: company.id },
                data: {
                  planStatus: 'active',
                  currentPeriodEnd: subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : null,
                },
              });
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const company = await prisma.company.findFirst({
            where: { stripeSubscriptionId: invoice.subscription },
          });
          if (company) {
            await prisma.company.update({
              where: { id: company.id },
              data: { planStatus: 'past_due' },
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const company = await prisma.company.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (company) {
            await prisma.company.update({
              where: { id: company.id },
              data: {
                plan: 'trial',
                planStatus: 'canceled',
                stripeSubscriptionId: null,
              },
            });
          }
          break;
        }

        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
