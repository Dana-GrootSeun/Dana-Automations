<div align="center">

# Dana Automates

### Small automations that save businesses hours every week.

[![Live Website](https://img.shields.io/badge/Live_Website-Visit-3ddc84?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dana-automates.therondana65.workers.dev)
[![Built with HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Built with CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Deployed on Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

**[View the live site](https://dana-automates.therondana65.workers.dev)**

</div>

---

## About

Dana Automates is my freelance automation portfolio. I build practical systems that reduce repetitive admin work for small businesses—from invoice reminders and spreadsheet cleanup to scheduled reports and customer follow-ups.

The website is intentionally lightweight: one fast, responsive page with no framework or paid hosting required.

## Services

- **Admin automation** — invoice chasing, quote generation and appointment reminders
- **Reports and spreadsheets** — cleanup, merging, scheduled reports and dashboards
- **Schedules and follow-ups** — social posts, customer follow-ups and booking confirmations
- **Data transfer and filing** — moving information between email, forms, spreadsheets and folders

## Highlights

- Responsive single-page design
- Interactive service and contact elements
- Accessible keyboard focus states
- FAQ accordion and smooth navigation
- Security headers for production hosting
- Zero-build deployment on Cloudflare

## Real automation code

This repository includes three working Python examples—not just website mockups:

### Download the realistic business workbook

[![Download Excel Demo](https://img.shields.io/badge/Excel-Business_Automation_Demo-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)](examples/dana-automates-business-demo.xlsx)

The workbook contains a formula-driven business dashboard, invoice tracker, customer CRM export and three-month sales log. It includes realistic sample businesses, editable statuses, conditional highlighting, KPI cards and charts.

| Automation | Business outcome | Code |
|---|---|---|
| Invoice reminders | Finds overdue unpaid invoices and prepares personalised messages | [`invoice_reminders.py`](automations/invoice_reminders.py) |
| Spreadsheet cleanup | Cleans customer data and removes duplicate records | [`spreadsheet_cleanup.py`](automations/spreadsheet_cleanup.py) |
| Weekly reporting | Calculates revenue, order volume, average value and top category | [`weekly_report.py`](automations/weekly_report.py) |

Each example includes sample data and automated tests. See the **[automation guide](automations/README.md)** for commands, customization options and the production delivery approach.

## Technology

| Area | Tools |
|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Hosting | Cloudflare Workers static assets |
| Version control | Git and GitHub |
| Design | Responsive, mobile-first dark interface |

## Project structure

```text
.
├── automations/ # Working Python automation examples
├── examples/    # Safe sample CSV data and polished Excel demo
├── tests/       # Automated behaviour tests
├── index.html   # Website, styling and interactions
├── _headers     # Cloudflare security and cache headers
└── README.md    # Project documentation
```

## Run locally

No installation or build step is needed. Open `index.html` in a browser.

For the best local experience, serve the folder with any simple static web server.

## Deployment

The production site is hosted free on Cloudflare:

**[dana-automates.therondana65.workers.dev](https://dana-automates.therondana65.workers.dev)**

Future updates can be deployed by uploading the site assets again or connecting this repository to Cloudflare for automatic deployments.

## Contact

Have a repetitive task that should run itself?

**Email:** [therondana65@gmail.com](mailto:therondana65@gmail.com)

---

<div align="center">
Built by <strong>Dana Theron</strong> in South Africa.
</div>
