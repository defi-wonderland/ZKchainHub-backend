import { createServer } from "./server.js";

const port = process.env.PORT || 3000;
const server = createServer();

server
    .get("/metrics/ecosystem", (_, res) => {
        return res.json({ message: `/metrics/ecosystem` });
    })
    .get("/metrics/zkchain/:chainId", (req, res) => {
        return res.json({ message: `/metrics/ecosystem/${req.params.chainId}` });
    });

server.listen(port, () => {
    console.log(`api running on ${port}`);
});
