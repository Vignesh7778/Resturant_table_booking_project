import psycopg2
import sys

regions = [
    "us-east-1", "eu-central-1", "ap-southeast-1", "us-west-1", "ap-south-1",
    "us-east-2", "eu-west-1", "eu-west-2", "ap-northeast-1", "ap-northeast-2",
    "ca-central-1", "sa-east-1", "us-west-2", "ap-southeast-2", "eu-central-2"
]

project_ref = "bwrhhsyakzvmmlajkzbk"
password = "Vicky__15200000"

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    print(f"Testing {region}...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=6543,
            dbname="postgres",
            user=f"postgres.{project_ref}",
            password=password,
            connect_timeout=3
        )
        print(f"\nSUCCESS! Your region is: {region}")
        conn.close()
        sys.exit(0)
    except Exception as e:
        if "tenant/user" not in str(e):
            print(f"  Error: {e}")

print("\nCould not find region!")
sys.exit(1)
