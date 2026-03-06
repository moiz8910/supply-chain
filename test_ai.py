import requests
import time
import sqlite3

def check_db():
    print("\n--- Checking Database Tasks ---")
    conn = sqlite3.connect('data/supply_chain.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()

def run_test():
    base_url = "http://localhost:8000/api/anomaly"
    ex_id = "EX-1042"
    
    print(f"1. Requesting Alternatives for {ex_id} (Checking LLM Generation)...")
    t0 = time.time()
    res = requests.get(f"{base_url}/alternatives/{ex_id}")
    print(f"Status Code: {res.status_code}")
    print(f"Time Taken: {time.time() - t0:.2f} seconds")
    
    if res.status_code == 200:
        alts = res.json()
        print("Received Alternatives:")
        for alt in alts:
            print(f"  - [{alt['id']}] {alt['title']}: {alt['description']}")
            
        if len(alts) > 0:
            chosen_id = alts[0]['id']
            print(f"\n2. Approving Alternative '{chosen_id}'...")
            post_res = requests.post(f"{base_url}/approve", json={"exception_id": ex_id, "alternative_id": chosen_id})
            print(f"Status Code: {post_res.status_code}")
            print("Response:", post_res.json())
            
            check_db()
        else:
            print("No alternatives returned!")
    else:
        print("Error fetching alternatives:", res.text)

if __name__ == '__main__':
    run_test()
