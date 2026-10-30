# Fuel Route landing page

The approved brief, as its issue states it.

## User stories

### R1 Display the product concept status
- [ ] The page clearly states that Fuel Route is a product concept shown as a demonstration.
- [ ] The page explicitly states that it is not a live service.
- [ ] The status is visible without requiring the user to navigate to another page or click a link.
Covers: S1

### R2 Identify the target audience
- [ ] The page explicitly names the target audience as logistics and real estate teams.
- [ ] The page explicitly names the target audience as customers in Ethiopia.
- [ ] The audience identification is presented in the main content area of the page.
Covers: S2

### R3 Present the problem statement with attribution
- [ ] The page describes the problem as 'Ethiopian Fuel Supply Blocked Without Petroleum Pipeline'.
- [ ] The description explicitly attributes the problem to StartupTribunal research.
- [ ] The page does not present the problem as established fact, but rather as a description provided by the research.
- [ ] The attribution is visible near the problem description.
Covers: S3, S5

### R4 Display research status and caveats
- [ ] The page indicates that the research was rejected by the StartupTribunal AI Tribunal.
- [ ] The page indicates that the research was published with caveats.
- [ ] The status information is presented as metadata about the research, not as part of the problem description itself.
- [ ] The caveats are acknowledged, though the specific content of the caveats is not required to be displayed unless specified.
Covers: S4

### R5 Provide a link to the source research
- [ ] The page includes a hyperlink to https://startuptribunal.com/catalog/ethiopian-fuel-supply-blocked-without-petroleum-pipeline.
- [ ] The link is labeled clearly to indicate it leads to the StartupTribunal research.
- [ ] The link is clickable and opens in a new tab or window to preserve the demonstration page context.
Covers: S5

## Decisions on open questions

- What specific visual design, layout, and copy structure should be used for the website to achieve a 'clear and credible' tone? (S1, S2, S3, S4, S5)
  **Decision:** Use a restrained, single-column layout with generous whitespace, a sober neutral palette, and short, factual copy that always frames claims as attributed research rather than established fact; include a visible 'demonstration' badge and a primary CTA to read the full research. (Reason: This structure directly supports the 'clear and credible' creative direction by prioritizing readability and attribution over decoration, while the visible demonstration label and CTA satisfy the brief's explicit requirements for a fictional business demo and primary action.)
- How should the specific 'caveats' from the rejected research be presented on the page? Should they be listed explicitly, summarized, or just acknowledged as existing? (S4)
  **Decision:** Acknowledge the caveats as existing by stating the research was 'rejected by the StartupTribunal AI Tribunal and published with caveats,' and direct readers to the source for details, without listing or summarizing specific caveats. (Reason: The brief does not enumerate the specific caveats, so listing or summarizing them would require inventing claims, which violates the 'no invented claims' constraint; acknowledging their existence and linking to the source is the only approach that remains fully grounded in the provided facts.)
- How much of the detailed research content, such as the $660 million pipeline figure and specific logistics details, should be surfaced on the page? Should it be quoted verbatim, paraphrased, or omitted in favor of a link to the full research? (S3, S5)
  **Decision:** Paraphrase the core problem framing and the $660 million figure lightly, explicitly attributing each point to StartupTribunal research, and provide a link to the full research for deeper detail. (Reason: Paraphrasing with clear attribution surfaces enough substance to be credible and useful without quoting verbatim (which risks misrepresentation) or omitting it entirely (which would make the page feel empty), while the link directs users to the authoritative source for the complete, caveated research.)

## Journeys

- **J1** (visitor) Determine who owns the site, its status, and navigate to the core content. Observed: facts-shown.
- **J2** (visitor) Understand the specific problem the concept addresses and the basis for the claims. Observed: facts-shown.
- **J3** (visitor) Access the underlying research to verify the claims made on the site. Observed: contact-links.

## Facts the site shows

- `F1`: Status: a product concept shown as a demonstration, not a live service
- `F2`: Who it is for: Logistics and real estate teams and customers in Ethiopia
- `F3`: Problem it explores, as described by StartupTribunal research: Ethiopian Fuel Supply Blocked Without Petroleum Pipeline
- `F4`: Research status: rejected by the StartupTribunal AI Tribunal, published with caveats.
- `F5`: Research by StartupTribunal: https://startuptribunal.com/catalog/ethiopian-fuel-supply-blocked-without-petroleum-pipeline

## Assumptions

- A public repository and a public site on GitHub Pages; no server or database.
- The frozen tests under `tests/` are the acceptance contract; changing them needs the owner's approval.
- Facts appear exactly as the brief gives them.
