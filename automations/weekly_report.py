"""Turn a sales CSV export into a concise weekly business summary."""

import argparse
import csv
from collections import Counter
from pathlib import Path


def build_sales_summary(sales):
    category_revenue = Counter()
    total_revenue = 0.0
    for sale in sales:
        amount = float(sale["amount"])
        total_revenue += amount
        category_revenue[sale["category"].strip()] += amount
    return {
        "total_revenue": total_revenue,
        "order_count": len(sales),
        "average_order": total_revenue / len(sales) if sales else 0.0,
        "top_category": category_revenue.most_common(1)[0][0] if category_revenue else "None",
    }


def format_report(summary):
    return (
        "WEEKLY SALES SUMMARY\n"
        "====================\n"
        f"Revenue: R{summary['total_revenue']:,.2f}\n"
        f"Orders: {summary['order_count']}\n"
        f"Average order: R{summary['average_order']:,.2f}\n"
        f"Top category: {summary['top_category']}\n"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file", type=Path)
    args = parser.parse_args()
    with args.csv_file.open(encoding="utf-8-sig", newline="") as file:
        summary = build_sales_summary(list(csv.DictReader(file)))
    print(format_report(summary))


if __name__ == "__main__":
    main()
