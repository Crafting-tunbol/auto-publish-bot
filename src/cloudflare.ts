import axios from "axios";

export class Cloudflare {
    token: string
    accountId: string;

    constructor (token: string, accountId: string) {
        this.token = token;
        this.accountId = accountId;
        this.checkToken();
    }

    private async checkToken() {
        await axios.get("https://api.cloudflare.com/client/v4/user/tokens/verify", {
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        });
    }
    
    async checkAccessLogs(sinceData: Date, accountId: string, app_uid: string): Promise<AccesLog[]> {
        const { data } = await axios.get(`https://api.cloudflare.com/client/v4/accounts/${accountId}/access/logs/access_requests?since=${sinceData.toISOString()}&app_uid=${app_uid}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/json"
            }
        });
        return data.result;
    }
}

export type AccesLog = {
    app_name: string,
    user_email: string,
    user_id: string,
    ip_address: string,
    app_uid: string,
    app_domain: string,
    app_type: string,
    action: string,
    connection: string,
    allowed: boolean,
    created_at: string,
    ray_id: string,
    country: string
}