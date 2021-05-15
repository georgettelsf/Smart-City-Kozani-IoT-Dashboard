
export default function generate(token, variables) {
    return `
    import time
    import requests
    import math
    import random
    
    TOKEN = "${token}"
    
    def build_payload():
        # Get the values here.
        payload = {'values':
                        {
                            ${variables.reduce((code, variable) => {
        return code + `'${variable.name}': '${variable.name} value',`
    }, '')}
                        }
        }
        return payload
    
    
    def post_request(payload):
        # Creates the headers for the HTTP requests
        url = "${process.env.NEXT_PUBLIC_API_URL}/api/metrics/" + TOKEN
        headers = {"Content-Type": "application/json"}
    
        # Makes the HTTP requests
        status = 400
        attempts = 0
        while status >= 400 and attempts <= 5:
            req = requests.post(url=url, headers=headers, json=payload)
            status = req.status_code
            attempts += 1
            time.sleep(1)
    
        # Processes results
        if status >= 400:
            print("[ERROR] Could not send data after 5 attempts, please check
            your token credentials and internet connection")
            return False
    
        print("[INFO] request made properly, your device is updated")
        return True
    
    
    def main():
        payload = build_payload(VARIABLE_LABEL_1, VARIABLE_LABEL_2)
    
        print("[INFO] Attemping to send data")
        post_request(payload)
        print("[INFO] finished")
    
    
    if __name__ == '__main__':
        while (True):
            main()
            time.sleep(1)
    `;
}