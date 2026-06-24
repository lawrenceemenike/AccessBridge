from backend.orchestrator import run_access_bridge

def main():
    test_happy_path = "I am a final-year student in Lagos. I am a STEM major looking for a scholarship."
    test_security_path = "I need a medical_fund. My NIN is 12345678901 and my email is test@user.com."

    print("--- HAPPY PATH TEST ---")
    try:
        happy_output = run_access_bridge(test_happy_path)
        print(happy_output)
    except Exception as e:
        print(f"Error during happy path: {e}")

    print("\n--- SECURITY INTERCEPTION TEST ---")
    try:
        security_output = run_access_bridge(test_security_path)
        print(security_output)
    except Exception as e:
        print(f"Error during security path: {e}")

if __name__ == "__main__":
    main()
