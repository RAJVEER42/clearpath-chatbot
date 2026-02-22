"""
Eval harness for ClearPath Chatbot.
Runs test queries against the API and reports pass/fail.

Usage: python run_eval.py [--url http://localhost:8000]
"""

import argparse
import json
import urllib.request
import urllib.error


def post_query(base_url: str, query: str) -> dict:
    url = base_url.rstrip("/") + "/query"
    payload = json.dumps({"question": query}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8000")
    args = parser.parse_args()

    with open("test_queries.json", "r") as f:
        tests = json.load(f)

    total = len(tests)
    passed = 0

    for test in tests:
        test_id = test["id"]
        desc = test.get("description", "")
        try:
            resp = post_query(args.url, test["query"])
        except (urllib.error.URLError, TimeoutError) as exc:
            print(f"FAIL {test_id} - {desc} (connection error: {exc})")
            continue
        except Exception as exc:
            print(f"FAIL {test_id} - {desc} (error: {exc})")
            continue

        errors = []
        classification = resp.get("metadata", {}).get("classification")
        if classification != test["expected_classification"]:
            errors.append(
                f"classification expected {test['expected_classification']}, got {classification}"
            )

        answer = resp.get("answer", "") or ""
        expected_contains = test.get("expected_answer_contains", [])
        missing = [
            s for s in expected_contains if s.lower() not in answer.lower()
        ]
        if missing:
            errors.append(f"answer missing {missing}")

        expected_flags = test.get("expected_flags", [])
        if expected_flags:
            flags = resp.get("metadata", {}).get("evaluator_flags", [])
            missing_flags = [f for f in expected_flags if f not in flags]
            if missing_flags:
                errors.append(f"flags missing {missing_flags}")

        if errors:
            print(f"FAIL {test_id} - {desc} ({'; '.join(errors)})")
        else:
            print(f"PASS {test_id} - {desc}")
            passed += 1

    print(f"{passed}/{total} passed")


if __name__ == "__main__":
    main()
