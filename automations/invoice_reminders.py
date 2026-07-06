"""Create safe email previews for overdue invoices from a CSV export."""

import argparse
import csv
from datetime import date, datetime
from pathlib import Path


def find_overdue_invoices(invoices, today=None):
    today = today or date.today()
    return [
        invoice
        for invoice in invoices
        if invoice.get("status", "").strip().lower() == "unpaid"
        and datetime.strptime(invoice["due_date"], "%Y-%m-%d").date() < today
    ]


def build_reminders(invoices):
    return [
        {
            "to": invoice["email"].strip(),
            "subject": f"Friendly reminder: invoice {invoice['invoice']}",
            "body": (
                f"Hi {invoice['customer'].strip()},\n\n"
                f"This is a friendly reminder that invoice {invoice['invoice']} "
                f"for R{invoice['amount']} was due on {invoice['due_date']}. "
                "Please let us know if payment has already been made.\n\nThank you."
            ),
        }
        for invoice in invoices
    ]


def read_invoices(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file", type=Path, help="Invoice CSV to inspect")
    args = parser.parse_args()
    reminders = build_reminders(find_overdue_invoices(read_invoices(args.csv_file)))
    if not reminders:
        print("No overdue unpaid invoices found.")
        return
    for reminder in reminders:
        print(f"\n--- PREVIEW TO {reminder['to']} ---")
        print(reminder["subject"])
        print(reminder["body"])


if __name__ == "__main__":
    main()
