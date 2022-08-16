import { config } from "dotenv";
import { app } from "./app";
import { dbConnection } from "./dbConnection";

config();

const PORT: number | string = process.env.PORT || 3111;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.listen(PORT, async () => {
  await dbConnection();
  console.log(`Server listening on PORT:${PORT}`);
});
