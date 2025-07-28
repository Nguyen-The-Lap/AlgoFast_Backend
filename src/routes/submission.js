import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code, language, input } = req.body;

  if (language === "python") {
    // Xử lý Python
    const filename = `temp_${Date.now()}.py`;
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, code);

    exec(`python "${filepath}"`, { timeout: 5000 }, (err, stdout, stderr) => {
      fs.unlinkSync(filepath);
      if (err) {
        return res.json({ output: stderr || err.message, success: false });
      }
      res.json({ output: stdout, success: true });
    }).stdin?.end(input || "");
  } else if (language === "cpp") {
    // Xử lý C++
    const cppFile = `temp_${Date.now()}.cpp`;
    const exeFile = `temp_${Date.now()}.exe`;
    const cppPath = path.join(process.cwd(), cppFile);
    const exePath = path.join(process.cwd(), exeFile);
    fs.writeFileSync(cppPath, code);

    // Biên dịch
    exec(`g++ "${cppPath}" -o "${exePath}"`, { timeout: 5000 }, (compileErr, _, compileStderr) => {
      if (compileErr || compileStderr) {
        fs.unlinkSync(cppPath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        return res.json({ output: compileStderr || compileErr.message, success: false });
      }
      // Chạy file thực thi với input
      const child = exec(`"${exePath}"`, { timeout: 5000 }, (runErr, stdout, stderr) => {
        fs.unlinkSync(cppPath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        if (runErr || stderr) {
          return res.json({ output: stderr || runErr.message, success: false });
        }
        res.json({ output: stdout, success: true });
      });
      if (child.stdin) child.stdin.end(input || "");
    });
  } else {
    res.status(400).json({ error: "Chỉ hỗ trợ Python và C++" });
  }
});

export default router;
