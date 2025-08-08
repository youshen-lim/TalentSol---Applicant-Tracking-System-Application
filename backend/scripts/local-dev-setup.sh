#!/bin/bash

# TalentSol XGBoost Local Development Setup Script
# This script sets up the complete local development environment

set -e  # Exit on any error

echo "🚀 TalentSol XGBoost Local Development Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the backend directory"
    exit 1
fi

# Step 1: Check prerequisites
log_info "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi
log_success "Node.js version: $(node --version)"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    log_error "Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
log_success "Python version: $($PYTHON_CMD --version)"

# Check/Install Yarn
if ! command -v yarn &> /dev/null; then
    log_warning "Yarn not found. Installing via npm..."
    npm install -g yarn
    log_success "Yarn installed"
else
    log_success "Yarn version: $(yarn --version)"
fi

# Step 2: Install Node.js dependencies with Yarn
log_info "Installing Node.js dependencies with Yarn..."
yarn install
log_success "Node.js dependencies installed"

# Step 3: Setup Python virtual environment
log_info "Setting up Python virtual environment..."

# Create ml-models directory structure
mkdir -p ml-models/shared
mkdir -p ml-models/decision-tree
mkdir -p ml-models/integration
mkdir -p ml-models/shared/logs
mkdir -p ml-models/shared/cache

# Create virtual environment if it doesn't exist
if [ ! -d "ml-models/shared/venv" ]; then
    log_info "Creating Python virtual environment..."
    $PYTHON_CMD -m venv ml-models/shared/venv
    log_success "Virtual environment created"
else
    log_success "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
log_info "Installing Python dependencies..."
source ml-models/shared/venv/bin/activate

# Create requirements.txt if it doesn't exist
if [ ! -f "ml-models/decision-tree/requirements.txt" ]; then
    log_info "Creating requirements.txt..."
    cat > ml-models/decision-tree/requirements.txt << EOF
# TalentSol XGBoost Model Requirements
# Local development environment with strict version constraints

# ⚠️ CRITICAL VERSION CONSTRAINTS ⚠️
# These versions must match your trained model exactly
scikit-learn==1.6.1    # EXACT VERSION REQUIRED
joblib==1.3.2          # Compatible with scikit-learn 1.6.1
pandas>=2.0.0          # Data manipulation
numpy>=1.24.0          # Numerical computing

# Optional ML libraries
xgboost>=1.7.0         # XGBoost ensemble methods
scipy>=1.10.0          # Scientific computing

# Development and testing
pytest>=7.0.0          # Testing framework
EOF
    log_success "Requirements.txt created"
fi

pip install -r ml-models/decision-tree/requirements.txt
log_success "Python dependencies installed"

# Step 4: Setup environment variables
log_info "Setting up environment variables..."

if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        log_success "Environment file created from example"
        log_warning "Please update .env.local with your database credentials"
    else
        log_warning ".env.local.example not found. Please create .env.local manually"
    fi
else
    log_success "Environment file already exists"
fi

# Step 5: Run XGBoost setup
log_info "Running XGBoost environment setup..."
yarn xgboost:setup
log_success "XGBoost environment setup completed"

# Step 6: Check database connection (optional)
log_info "Checking database connection..."
if [ -n "$DATABASE_URL" ] || grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    if yarn db:check 2>/dev/null; then
        log_success "Database connection successful"
        
        # Run XGBoost migration if database is available
        log_info "Running XGBoost database migration..."
        if yarn xgboost:migrate 2>/dev/null; then
            log_success "XGBoost database migration completed"
        else
            log_warning "XGBoost migration failed. Please run manually: yarn xgboost:migrate"
        fi
    else
        log_warning "Database connection failed. Please check your DATABASE_URL"
    fi
else
    log_warning "DATABASE_URL not configured. Please update .env.local"
fi

# Step 7: Test XGBoost model (if model file exists)
log_info "Testing XGBoost model integration..."
if [ -f "ml-models/decision-tree/best_performing_model_pipeline.joblib" ]; then
    if yarn xgboost:test-model 2>/dev/null; then
        log_success "XGBoost model test passed"
    else
        log_warning "XGBoost model test failed. This is expected if the model file is not present."
    fi
else
    log_warning "XGBoost model file not found. Please place your trained model at:"
    echo "   ml-models/decision-tree/best_performing_model_pipeline.joblib"
fi

# Step 8: Display summary
echo ""
echo "🎉 Local Development Setup Complete!"
echo "===================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your database credentials"
echo "2. Place your XGBoost model file at: ml-models/decision-tree/best_performing_model_pipeline.joblib"
echo "3. Run database migration: yarn xgboost:migrate"
echo "4. Start the development server: yarn dev"
echo "5. Test XGBoost integration: yarn xgboost:test-model"
echo ""
echo "🔗 Available Commands:"
echo "   yarn dev                    - Start development server"
echo "   yarn xgboost:setup         - Setup XGBoost environment"
echo "   yarn xgboost:test-model    - Test XGBoost model"
echo "   yarn xgboost:init          - Initialize XGBoost service"
echo "   yarn xgboost:migrate       - Run database migration"
echo "   yarn xgboost:process-pending - Process pending applications"
echo ""
echo "📁 Project Structure:"
echo "   backend/"
echo "   ├── ml-models/"
echo "   │   ├── decision-tree/          # Your XGBoost model"
echo "   │   ├── integration/            # Python wrappers"
echo "   │   └── shared/venv/           # Python virtual environment"
echo "   ├── src/services/              # XGBoost services"
echo "   └── src/scripts/               # Setup and test scripts"
echo ""
echo "🌐 Endpoints (when server is running):"
echo "   http://localhost:3001/api/xgboost/status"
echo "   http://localhost:3001/api/xgboost/metrics"
echo "   WebSocket: ws://localhost:9001"
echo ""

# Check if model file exists and provide specific guidance
if [ ! -f "ml-models/decision-tree/best_performing_model_pipeline.joblib" ]; then
    echo "⚠️  IMPORTANT: XGBoost Model File Missing"
    echo "   Please download your trained model from:"
    echo "   https://github.com/youshen-lim/TalentSol_Supervised-Classifier-for-Initial-Candidate-Screening-Decision-Trees"
    echo "   And place it at: ml-models/decision-tree/best_performing_model_pipeline.joblib"
    echo ""
fi

log_success "Setup script completed successfully!"

# Deactivate virtual environment
deactivate 2>/dev/null || true
