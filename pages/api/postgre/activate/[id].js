import axios from "axios";

export default function handler(req, res) {
    /**
     * GET method
     */
    if (req.method === 'GET') {
        /**
         * /---------------------- GET ----------------------/
         * Activate account
         * @action activate_account
         * @param id emailActivationId
         */
        if (req.query?.action === 'activate_account' && req.query?.id) {
            const emailActivationId = req.query.id

            axios.get(`${process.env.HOME_URL}/api/postgre/?action=activate_account&emailActivationId=${emailActivationId}`).then(postgreRes => {
                if (postgreRes.data?.success) {
                    res.json({
                        success: true,
                    })
                }
                else {
                    res.end();
                }
            });
        }
    }
}