import { Hono } from "hono";
import type { Context, Next } from "hono";

export type Env = CloudflareBindings;

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("Hello from Hono on Cloudflare Workers 🔥"));

// const requireApiKey = (c: Context, next: Next) => {
//   const key = c.req.header("x-api-key");

//   if (!key || key !== c.env.AI_DEMO_API_KEY) {
//     return c.json({ error: "Unauthorized" }, 401);
//   }

//   return next();
// };

app.post(
  "/classify",
  /* requireApiKey, */ async (c) => {
    // Parse multipart/form-data
    const body = await c.req.parseBody();
    const file = body["image"];

    if (!(file instanceof File)) {
      return c.json({ error: 'No image file uploaded (field: "image")' }, 400);
    }

    // Get bytes from uploaded file
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const inputs = {
      image: [...uint8],
    };

    // Call Cloudflare AI model
    const result = await c.env.AI.run("@cf/microsoft/resnet-50", inputs);

    return c.json({
      filename: file.name,
      size: file.size,
      response: result,
    });
  }
);

app.post(
  "/classify/raw",
  /*  requireApiKey, */ async (c) => {
    // Entire request body is the image
    const arrayBuffer = await c.req.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const inputs = {
      image: [...uint8],
    };

    const result = await c.env.AI.run("@cf/microsoft/resnet-50", inputs);

    return c.json({ response: result });
  }
);

export default app;
