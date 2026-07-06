"""Clean and deduplicate a customer-list CSV using email as the key."""

import argparse
import csv
from pathlib import Path


def clean_customer_file(source, destination):
    source = Path(source)
    destination = Path(destination)
    with source.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        fieldnames = [name.strip().lower() for name in (reader.fieldnames or [])]
        clean_rows = []
        rows_read = 0
        seen_emails = set()
        for raw_row in reader:
            rows_read += 1
            row = {key.strip().lower(): (value or "").strip() for key, value in raw_row.items()}
            row["email"] = row.get("email", "").lower()
            if not row["email"] or row["email"] in seen_emails:
                continue
            seen_emails.add(row["email"])
            clean_rows.append(row)

    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)
    return {"rows_written": len(clean_rows), "duplicates_removed": rows_read - len(clean_rows)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    result = clean_customer_file(args.source, args.destination)
    print(f"Wrote {result['rows_written']} clean customer rows to {args.destination}")


if __name__ == "__main__":
    main()
