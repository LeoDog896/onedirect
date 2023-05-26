import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const app = new Application();

console.log("http://localhost:8080/");
let site = "https://example.com";
const correctPin = "1234";

app
  .get("/", (c) => {
    c.redirect(site);
  })
  .get("/admin", async (c) => {
    const { pin } = c.cookies;
    if (pin === correctPin) {
      return await Deno.readTextFile("./admin.html");
    } else {
      c.setCookie({
        name: "pin",
        value: "",
        maxAge: 1,
      });
      return await Deno.readTextFile("./login.html");
    }
  })
  .post("/admin/login", async (c) => {
    const body = await c.body;
    const type = z.object({
      pin: z.string(),
    }).safeParse(body);
    if (!type.success) {
      return c.redirect("/admin");
    }
    const { pin } = type.data;
    if (pin === correctPin) {
      c.setCookie({
        name: "pin",
        value: pin,
        maxAge: 60 * 60 * 24,
      });
      c.redirect("/admin");
    } else {
      c.redirect("/admin");
    }
  })
  .post("/admin/update", async (c) => {
    if (!c.cookies?.pin) {
      return c.redirect("/admin");
    }
    const body = await c.body;
    const type = z.object({
      url: z.string(),
    }).safeParse(body);
    if (!type.success) {
      console.log("failed");
      return c.redirect("/admin");
    }
    site = type.data.url;
    c.redirect("/admin");
  })
  .start({ port: 8080 });