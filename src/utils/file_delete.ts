import fs from "fs";
import path from "path";

export const deletefile = (fileName: string) => {
  fs.unlink(
    path.join(process.cwd(), "src", "uploads") + "/" + fileName,
    (err) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    }
  );
};
