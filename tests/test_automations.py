import csv
import tempfile
import unittest
from datetime import date
from pathlib import Path

from automations.invoice_reminders import build_reminders, find_overdue_invoices
from automations.spreadsheet_cleanup import clean_customer_file
from automations.weekly_report import build_sales_summary


class InvoiceReminderTests(unittest.TestCase):
    def test_finds_only_unpaid_invoices_past_due_date(self):
        invoices = [
            {"customer": "A", "email": "a@example.com", "invoice": "INV-1", "amount": "450", "due_date": "2026-07-01", "status": "unpaid"},
            {"customer": "B", "email": "b@example.com", "invoice": "INV-2", "amount": "900", "due_date": "2026-07-20", "status": "unpaid"},
            {"customer": "C", "email": "c@example.com", "invoice": "INV-3", "amount": "100", "due_date": "2026-06-01", "status": "paid"},
        ]

        overdue = find_overdue_invoices(invoices, today=date(2026, 7, 10))

        self.assertEqual(["INV-1"], [item["invoice"] for item in overdue])

    def test_builds_personalised_preview_messages(self):
        messages = build_reminders([{"customer": "Dana", "email": "d@example.com", "invoice": "INV-9", "amount": "700", "due_date": "2026-07-01", "status": "unpaid"}])

        self.assertIn("Dana", messages[0]["body"])
        self.assertIn("INV-9", messages[0]["subject"])
        self.assertEqual("d@example.com", messages[0]["to"])


class SpreadsheetCleanupTests(unittest.TestCase):
    def test_trims_values_normalises_email_and_removes_duplicates(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "customers.csv"
            destination = Path(folder) / "clean.csv"
            source.write_text("Name,Email,Phone\n Dana , DANA@EXAMPLE.COM , 0123 \nDana Again,dana@example.com,9999\n", encoding="utf-8")

            result = clean_customer_file(source, destination)

            with destination.open(encoding="utf-8", newline="") as file:
                rows = list(csv.DictReader(file))
            self.assertEqual(1, result["rows_written"])
            self.assertEqual(1, result["duplicates_removed"])
            self.assertEqual("Dana", rows[0]["name"])
            self.assertEqual("dana@example.com", rows[0]["email"])


class WeeklyReportTests(unittest.TestCase):
    def test_summarises_revenue_orders_and_top_category(self):
        sales = [
            {"date": "2026-07-01", "category": "Repairs", "amount": "500"},
            {"date": "2026-07-02", "category": "Repairs", "amount": "250"},
            {"date": "2026-07-03", "category": "Parts", "amount": "300"},
        ]

        summary = build_sales_summary(sales)

        self.assertEqual(1050.0, summary["total_revenue"])
        self.assertEqual(3, summary["order_count"])
        self.assertEqual("Repairs", summary["top_category"])


if __name__ == "__main__":
    unittest.main()
