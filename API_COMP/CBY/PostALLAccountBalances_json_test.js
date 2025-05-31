const express = require('express');
const router = express.Router();

router.use(express.json({ limit: "100mb" }));

router.post('/CBY/PostALLAccountBalances_test', (req, res) => {
    const requests = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json(writeError('البيانات غير صالحة'));
    }

    for (let i = 0; i < requests.length; i++) {
        const item = requests[i];

        // ✅ شرط: balances غير موجود أو فارغ
        if (!Array.isArray(item.balances) || item.balances.length === 0) {
            return res.status(400).json({
                code: 5005,
                message: `400 - {\"type\":\"https://tools.ietf.org/html/rfc9110#section-15.5.1\",\"title\":\"One or more validation errors occurred.\",\"status\":400,\"errors\":{\"[${i}].Balances\":[\"The Account Balance must have at least one balance item\"]},\"traceId\":\"00-81661751fcebffc655b3a05394d105da-2747fb2172886263-00\"}`
            });
        }

        // ✅ شرط: accCatId = 100
        if (item.accCatId === 100) {
            return res.status(400).json({
                code: 5005,
                message: `400 - {\"type\":\"https://tools.ietf.org/html/rfc9110#section-15.5.1\",\"title\":\"One or more validation errors occurred.\",\"status\":400,\"errors\":{\"[${i}].AccCatId\":[\"This Account CategoryId is not found in AccountCategory List\"]},\"traceId\":\"00-b9f837915a7b45989003eed881badf86-e7b937957f33d739-00\"}`
            });
        }

        // ✅ شرط: curId ليس USD أو YER
        for (let j = 0; j < item.balances.length; j++) {
            const bal = item.balances[j];
            if (!['USD', 'YER'].includes(bal.curId)) {
                return res.status(400).json({
                    code: 5005,
                    message: `400 - {\"type\":\"https://tools.ietf.org/html/rfc9110#section-15.5.1\",\"title\":\"One or more validation errors occurred.\",\"status\":400,\"errors\":{\"[${i}].Balances[${j}].CurId\":[\"This currency value must be selected from currency List.\"]},\"traceId\":\"00-3fa40d6c7b1673e0276b491ca765981f-cf9a7fd9ace85a69-00\"}`
                });
            }
        }

        // ✅ شرط: mainAccNo = "5181"
        if (item.mainAccNo === "5181") {
            return res.status(400).json({
                code: 5005,
                message: `400 - {\"success\":{},\"error\":[{\"code\":409,\"message\":\"البيانات موجودة مسبقاً: ${item.blncDate || "unknown"}\"}]}`
            });
        }
    }

    // ✅ إذا لم تنطبق أي شروط، نجاح
    return res.status(200).json({
        success: {
            code: 200,
            message: "Added Successfully"
        },
        error: []
    });
});

// Helper
function writeError(message) {
    return {
        code: 5005,
        message: `400 - {"error":"${message}"}`
    };
}

module.exports = router;
