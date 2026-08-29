import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({limit:"1mb"}));
app.use(express.static("."));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const schemaHint = {
  project: {
    offer:"string", audience:"string", problem:"string", result:"string",
    price:"string", freebie:"string", story:"string", funnel:"string", next:"string",
    pages:["string"], sections:["string"],
    copy:{hero:"string",sub:"string",problemHead:"string",solution:"string",cta:"string"},
    emails:["string"]
  }
};

app.post("/api/generate", async (req,res)=>{
  try{
    const p=req.body?.project||{};
    const model=req.body?.model||"gpt-5.6-luna";
    const prompt=`You are BrandFlow, an expert direct-response funnel strategist and conversion copywriter.
Turn the supplied business information into a complete, specific funnel package.
Do not invent testimonials, guarantees, results, certifications, prices, or factual claims. Use placeholders when proof is missing.
Adapt the funnel to the business model and goal.
Return ONLY valid JSON matching this shape:
${JSON.stringify(schemaHint,null,2)}

Business data:
${JSON.stringify(p,null,2)}

Requirements:
- Improve the offer name and positioning if needed.
- Recommend the best freebie for the market.
- Create the complete page plan appropriate to the funnel.
- Write usable hero, subheadline, problem, solution and CTA copy.
- Create 5-7 concise email sequence subjects/purposes.
- For booking/application funnels, include qualification/application and confirmation steps.
- For ecommerce, include product/sales, checkout and post-purchase steps.
- Keep copy clear, specific, persuasive and honest.`;

    const response = await client.responses.create({model,input:prompt});
    let text=response.output_text||"";
    text=text.replace(/^```json\s*/i,"").replace(/```$/,"").trim();
    const data=JSON.parse(text);
    res.json(data);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"AI generation failed",detail:err.message});
  }
});

app.listen(process.env.PORT||3000,()=>console.log("BrandFlow V13 running on http://localhost:"+(process.env.PORT||3000)));
