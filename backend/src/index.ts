import "dotenv/config";
import app from "./app";

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
