import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      isActive && "border-ats-blue text-ats-dark-blue hover:bg-ats-light-blue/10 hover:text-ats-dark-blue",
      !isActive && "hover:bg-ats-light-blue/10 hover:text-ats-dark-blue",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4 text-ats-blue" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4 text-ats-blue" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-ats-blue" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// Enhanced pagination component with page numbers
interface PaginationWithNumbersProps {
  className?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const PaginationWithNumbers = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationWithNumbersProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    const leftSiblingIndex = Math.max(2, currentPage - siblingCount);
    const rightSiblingIndex = Math.min(totalPages - 1, currentPage + siblingCount);

    // Add ellipsis indicators
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Generate the actual page numbers
    if (shouldShowLeftDots) {
      pageNumbers.push(-1); // -1 represents left ellipsis
    }

    // Add page numbers between ellipses
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) { // Skip first and last page (already added)
        pageNumbers.push(i);
      }
    }

    if (shouldShowRightDots) {
      pageNumbers.push(-2); // -2 represents right ellipsis
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNumber, i) => {
          // Render ellipsis
          if (pageNumber < 0) {
            return (
              <PaginationItem key={`ellipsis-${pageNumber}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          // Render page number
          return (
            <PaginationItem key={`page-${pageNumber}`}>
              <PaginationLink
                isActive={pageNumber === currentPage}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
PaginationWithNumbers.displayName = "PaginationWithNumbers";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationWithNumbers,
}
