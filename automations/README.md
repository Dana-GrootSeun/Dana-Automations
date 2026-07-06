# Working automation examples

These small Python tools demonstrate the core pattern behind Dana Automates:

```text
business export → validate and transform → useful result
```

They use only Python's standard library, so there are no paid services or package installs. They are deliberately small enough to audit and adapt for a real client.

## 1. Invoice reminder previews

Reads an invoice export, finds unpaid invoices past their due date, and prepares personalised reminder messages.

```powershell
python -m automations.invoice_reminders examples/invoices.csv
```

The example only prints previews. A client version can connect the final step to Outlook, Gmail, an accounting platform or another approved email provider. Keeping preview mode as the default prevents accidental sends.

Expected columns: `customer`, `email`, `invoice`, `amount`, `due_date`, `status`.

## 2. Customer spreadsheet cleanup

Trims inconsistent spacing, normalises column names and email addresses, drops blank-email rows, and deduplicates customers by email.

```powershell
python -m automations.spreadsheet_cleanup examples/customers.csv output/clean-customers.csv
```

A client version can add phone-number formatting, address validation, multiple-file merging and scheduled folder monitoring.

## 3. Weekly sales report

Turns a basic sales export into a concise management summary with revenue, order count, average order value and the highest-performing category.

```powershell
python -m automations.weekly_report examples/sales.csv
```

A client version can create a PDF or Excel workbook, add week-over-week comparisons, and deliver it automatically every Monday.

## Run the tests

```powershell
python -m unittest discover -s tests -v
```

The tests cover overdue-invoice selection, reminder personalisation, spreadsheet cleanup and sales calculations.

## Production approach

Real projects follow a consistent delivery process:

1. Map the client's current manual workflow.
2. Agree on input files, rules and expected output.
3. Build against anonymised sample data.
4. Demo in preview mode.
5. Add external integrations only after approval.
6. Schedule the workflow and add failure alerts.
7. Provide source code, setup notes and support.
