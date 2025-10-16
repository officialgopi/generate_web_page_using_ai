import express from "express";
import "dotenv/config";

const app = express();
let pageCount = fs.readdirSync("./output").length;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

//AI
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createHTML } from "./tools.js";

const model = new ChatGoogleGenerativeAI({
  temperature: 1,
  model: "gemini-flash-latest",
  apiKey: GOOGLE_API_KEY,
});

import fs from "fs";

app.get("/health", (req, res) => {
  res.send("Server is healthy");
});

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/public/index.html`);
});

app.get("/api/pages", async (req, res) => {
  const files = await fs.promises.readdir("./output");

  res.json({
    pages: files,
  });
});

app.get("/page/:page", (req, res) => {
  const { page } = req.params;

  if (!fs.existsSync(`${process.cwd()}/output/${page}/index.html`)) {
    res.status(404).send("Page not found");
    return;
  }

  res.sendFile(`${process.cwd()}/output/${page}/index.html`);
});

app.use(express.json());
app.post("/", async (req, res) => {
  const { prompt } = req.body;

  const response = await model.invoke([
    {
      role: "system",
      content: `You are a Senior Frontend Developer, have mastery at  HTML, CSS, Javascript, Tailwindcss.
          You prefer to use Tailwindcss over other css frameworks and craete websites in HTML with Tailwindcss and Framer Motion.
          Make It in a whole single HTML file with internal CSS and JS.
        KEEP THIS IN MIND:
            - Make sure the code is responsive and works on all devices.
            - Make sure to use Tailwindcss for styling.
            - Make sure to use Framer Motion for animations.
            - Make sure to use semantic HTML tags.
            - Make sure to use best practices for accessibility.
            - Make sure to use best practices for SEO.
            - Make sure to use best practices for performance.
            - Make sure to use best practices for security.
            - Make sure to use best practices for code quality.
            - Make sure to use best practices for code readability.
            - Make sure to use best practices for code maintainability.
            - Make sure to use best practices for code reusability.

        Give the output in JSON Format with thwo keys "reply" and "code" like this:
    
    response = {
            "reply": "This is the reply to the user",
            "code": "<!DOCTYPE html>...</html>"
    }
          `,
    },
    {
      role: "user",
      content: `Generate a complete HTML page with Tailwindcss and Framer Motion for the following prompt: ${prompt}. Make sure to include all the necessary HTML, CSS and JS in a single file.
          
            Make sure the code is responsive and works on all devices.
            Make sure to use Tailwindcss for styling.
            Make sure to use Framer Motion for animations.
            Make sure to use semantic HTML tags.


      `,
    },
  ]);

  const json = response.content.slice(
    response.content.indexOf("{"),
    response.content.lastIndexOf("}") + 1
  );
  const responseJson = JSON.parse(json);

  await createHTML(pageCount + 1, responseJson.code);
  pageCount++;
  res.json({
    page: `gen-${pageCount}`,
  });
});
