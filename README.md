# Property Insight Hub

## Running the frontend

```powershell
npm install
$env:IVY_API_KEY = "your-issued-key"
npm run dev
```

The app runs through a server-side `/api/ivy` proxy so the API key is never
sent from browser code. For local development, put the issued key in an
ignored `.env.local` file as `IVY_API_KEY=...`. Sign in with any of the three
demo accounts and the shared password from the assignment email.

## Implementation and audit notes

The client uses one typed API module, persists the Ivy session in local storage,
refreshes access tokens when the live service returns 401, and follows the
observed `limit`/`offset`/`has_more` pagination contract until all records are
retrieved. Listing filters are applied again on the client so the displayed
results do not depend on undocumented server-side filter behavior. Rentals and
projects use their observed price units: rental `price` is monthly rent and
project prices are crore-valued numbers despite the reference claiming rupees.

The live API differed from the reference in authentication headers, token
expiry and refresh behavior, detail and saved-listing paths, analytics
availability, pagination, timestamps, project counts, duplicate-looking
records, negative prices, and booking-gated fake listings. These reproduced
findings and the computed answers are recorded in `submission.json`.

Checks that turned out to be fine included the locality, BHK, furnishing, and
price listing filters: each changed the returned result set and totals when
tested against an unfiltered request. The collection metadata also accurately
reported the observed offset, count, total, and continuation state.

With another two days, I would add automated contract tests against captured
API fixtures, improve the evidence review UI with links to flagged records, and
deploy the server-backed frontend so `demo_url` can be supplied in the
submission.

Hi Manpreet Kaur,

Thanks for registering for the Ivy Homes internship assignment.

Start with the problem statement (statement.md, attached). The API reference and a submission template are attached too.

Your details

Base URL	https://solve.ivy.homes
API key	IVY26-F874B625E451
City	Gurgaon
Assigned locality	Sector 49 (question 5 asks about it)
Demo accounts

The frontend you build must let these three accounts log in. They all use the same password.

Users	demo1@ivy.homes, demo2@ivy.homes, demo3@ivy.homes
Password	e076169e46
Submission

Submit here	https://forms.gle/e8L79HaN3MbJJact7
Deadline	23:59 IST on Monday 14 September 2026
Please note

Your API key is yours alone. It decides your city and your correct answers, so sharing it helps nobody and disqualifies both of you.
Keep this email. If you lose it, register again and we will re-send the same key.
Something broken? If it is genuinely broken, not just undocumented, email vivek@ivy.homes.
# Ivy Homes — Software Engineering Internship, September 2026

**6-month internship · 4th year B.Tech · Bengaluru**

You have 3 days. The work is scoped to about one focused day. The extra time is
so that you can think, not so that you can grind.

---

## The situation

We run a property API. Somebody asked an AI assistant to write the API
documentation from an old changelog, nobody reviewed it, and it shipped.

The documentation is wrong in places. Some endpoints in it do not exist. Some
exist at a different path. Some fields are not in the units the documentation
claims. Some parameters are accepted and quietly ignored. And some of it is
perfectly correct.

**The API itself is honest and healthy.** It is not buggy, it is not flaky, and
it is not trying to trick you. Every page of results tells you truthfully what
the server just did — which limit and offset it used, how many records it
returned, and whether more remain. Every error message is written to be useful.
Everything you need is observable from the API. Nothing is hidden behind
something you cannot reach.

**Your job is to build a working frontend on top of it anyway** — and to hand us
a list of everywhere the documentation lies.

You will get, by email, when you register:

- the base URL
- an API key, scoped to one city
- login credentials for three demo users
- `API_REFERENCE.md`, the documentation described above

---

## Getting your API key

Register at **https://solve.ivy.homes/register** with your college email address
(**@mnnit.ac.in**). Your key arrives at that address within a few minutes, along
with your city, your assigned locality, the demo logins and their password. If it
does not, check your spam folder.

One key per person. Registering again re-sends the key you already have; it does
not issue a new one.

Registration closes at **23:59 IST on Sunday 13 September 2026**, 24 hours before
the submission deadline. The deadline is the same for everybody, so register as
soon as you have read this.

---

## What we are actually testing

You will use an LLM for this. We expect you to; we use them all day. So this
assignment is not about whether you can get Claude or Cursor to write a React
app — you can, and so can everybody else applying.

It is about what happens next.

Point an agent at this API, tell it the documentation might be wrong, and it
will sweep the endpoints, find the paths that 404, read a sample response, and
patch the documentation. Good. Do that — it is the right first move and it will
save you an hour.

It will not get you far. Most of what is wrong here does not live in any single
response, and nothing in any response announces it. Finding it means deciding
what to look for before you can look — forming a hypothesis about how this data
could be wrong, and then testing it. Your tools will happily test any hypothesis
you give them. They will not give you the hypothesis.

And when you have one, the first rule that fits will usually fit most of the
data. Look hard at what it gets wrong. That is where the answer is.

That is the job, and it is what we are hiring for.

---

## Part 1 — Build the frontend

A web application. Anything you like: React, Next, Vue, Svelte, SvelteKit,
plain HTML. Deploy it somewhere we can open it (Vercel, Netlify, Cloudflare
Pages, GitHub Pages, Render — all have free tiers).

Six things must work:

1. **Login.** Real credentials against the real auth flow. The session must
   survive a page refresh, and the app must still be working thirty minutes
   after you logged in.
2. **Browse listings.** A paginated or infinite-scrolling list. Filters for
   locality, bedrooms, price range and furnishing must actually filter, whether
   or not the server helps you.
3. **Listing detail.** A page per listing, reachable by URL.
4. **Saved listings.** Add, remove, list. Per user, and still there after a
   reload and a re-login.
5. **Rentals and projects.** Browsable, with correct prices and correct areas.
6. **An insights screen.** Whatever the documentation promised from
   `/v1/analytics/summary`, plus anything you learned about the data that a
   user would want to know. This screen is where your discoveries become
   visible to a human.

Anything beyond these six is welcome but is worth far less than the six being
correct. A small app where every number is right beats a large one where they
are not.

We are not scoring you on a mobile app. Build the web app.

---

## Part 2 — Answer ten questions

All ten are about **your** city. Two candidates with different keys have
different correct answers, so comparing notes will not help you.

Anchor everything to a fixed reference moment:

```
REFERENCE = 2026-09-10T00:00:00+05:30   (IST)
```

"Retrievable" below means: every record your key can obtain from that endpoint
with no filters applied, having paged all the way to the end.

| # | Key in `answers` | Question |
| --- | --- | --- |
| 1 | `total_listing_records` | How many listing records are retrievable from `/v1/listings`? |
| 2 | `unique_properties` | Among those records, genuine or not, how many distinct properties do they describe? A property described by several records counts once. |
| 3 | `active_listings` | How many retrievable listing records have `is_live` true? |
| 4 | `corrupt_listing_ids` | A small number of listing records describe something that cannot exist. List their `listing_id`s, sorted. |
| 5 | `total_monthly_rent` | Sum of monthly rent across all retrievable rental records in your **assigned locality** (it is in the email with your key). |
| 6 | `avg_price_per_sqft_2bhk` | Across retrievable listing records where `is_live` is true and `bedroom` is 2, leaving out the records in your answers to 4 and 9: the mean of price divided by carpet area, in rupees per square foot, to 2 decimals. |
| 7 | `costliest_project` | The project with the highest maximum price, as `{"project_id": ..., "price_max_inr": ...}`. |
| 8 | `listings_last_7_days` | How many retrievable listing records were posted in the seven days before `REFERENCE`, i.e. in `[REFERENCE - 7 days, REFERENCE)`, in IST? |
| 9 | `fake_listing_ids` | Some of these listings are not real. They exist to generate enquiries. List their `listing_id`s, sorted. |
| 10 | `projects_with_wrong_listing_count` | Every project reports how many listings it has. For how many projects is that number wrong? |

Counts are graded exactly. Questions 2, 6 and 7 allow ±1%. Questions 4 and 9 are
scored on how much of the real list you found versus how much you invented.

---

## Part 3 — List the lies

Every place the documentation disagrees with the API, as `findings` in your
submission. One object per discrepancy:

```json
{
  "endpoint": "/health",
  "category": "timestamps",
  "documented": "returns service status and the server clock",
  "actual": "it does, and the clock carries an explicit +05:30 offset",
  "how_found": "called it before writing any other code",
  "impact": "none - this one is an example of the format, not a discrepancy",
  "evidence": []
}
```

`endpoint` is the path the discrepancy is about. Write it exactly as the
documentation writes it when the documentation is what is wrong, and exactly as
the API serves it when you are reporting something the documentation left out.
Replace any path parameter with `{id}` — `/v1/listings/{id}`, not
`/v1/listings/100-1000042`. Use `*` when the discrepancy applies to every
endpoint.

`evidence` is a list of identifiers — `listing_id`s, `project_id`s or phone
numbers — that show the discrepancy. It is required whenever the finding is a
claim about records rather than about how an endpoint behaves: records that
repeat, records that are impossible or not genuine, values in the wrong unit,
counts that disagree, records the endpoint should not have returned. Name up to
twenty that show it. A finding like that with no evidence, or whose evidence
mostly does not show it, counts as a claim you did not reproduce.

`category` must be one of:

| Category | Use it for |
| --- | --- |
| `auth` | Anything about keys, tokens, headers, sessions |
| `pagination` | Page parameters, limits, counts, how to reach the last record |
| `units` | A number that is not in the unit the documentation claims |
| `filters` | A filter parameter that does not filter |
| `sorting` | A sort parameter that does not sort |
| `timestamps` | Timezone or format problems in dates and times |
| `duplicates` | Records that are not as distinct as documented |
| `completeness` | The endpoint returns more or less than documented |
| `data_quality` | Records whose contents are impossible |
| `fraud` | Records that are deliberately not genuine |
| `consistency` | Two endpoints that contradict each other |
| `missing_endpoint` | Documented, but does not exist at that path |
| `undocumented_endpoint` | Exists, but is not in the documentation |

**Precision counts as much as recall.** A findings list padded with guesses
scores worse than a short list that is right. Do not report a discrepancy you
have not personally reproduced.

---

## Submission

One public GitHub repository containing your frontend, and at its root a file
named `submission.json`:

```json
{
  "api_key": "IVY26-XXXXXXXXXXXX",
  "candidate": {
    "name": "Your Name",
    "email": "you@example.com",
    "repo_url": "https://github.com/you/ivy-assignment",
    "demo_url": "https://your-app.vercel.app"
  },
  "answers": {
    "total_listing_records": 0,
    "unique_properties": 0,
    "active_listings": 0,
    "corrupt_listing_ids": [],
    "total_monthly_rent": 0,
    "avg_price_per_sqft_2bhk": 0.0,
    "costliest_project": { "project_id": "", "price_max_inr": 0 },
    "listings_last_7_days": 0,
    "fake_listing_ids": [],
    "projects_with_wrong_listing_count": 0
  },
  "findings": []
}
```

Also include a `README.md` covering:

- how to run it
- how you worked out which parts of the documentation to distrust, and what you
  did about it
- **what you checked that turned out to be fine.** The hypotheses that did not
  pan out tell us more about how you think than the ones that did, and they are
  the part nobody can generate for you
- what you would do with another two days

Commit as you go. A repository with one commit at the deadline tells us nothing
about how you work, and we do read the history.

Submit through **https://forms.gle/e8L79HaN3MbJJact7** before **23:59 IST on Monday 14 September 2026**.

---

## How this is scored

**Stage 1 — automatic, everybody.**

| | Weight |
| --- | --- |
| The ten answers | 60 |
| Findings, scored as F1 against what is actually wrong for *your* key | 40 |

The ten answers are not worth the same. The ones that need you to work something
out are worth considerably more than the ones that need you to count.

**Stage 2 — human review, for the highest scorers from stage 1.** We open your
app, use it, read your code and read your commit history.

Final selection weights stage 1 at 50%, the application at 40%, and your
writeup and commit history at 10%.

---

## Rules

- Use any LLM, any framework, any library. Say so in your README; it costs you
  nothing and lying about it costs you the internship.
- Do not attack the API. No credential stuffing, no scanning for other people's
  keys, no denial of service. The rate limit is 1200 requests per minute per key,
  which is far more than a correct solution needs. Every request you make is
  logged against your key.
- Everything in your submission is yours. We grade what it says, including
  anything your tools put there without you reading it.
- Your key is yours. Sharing keys is disqualifying — and pointless, since a key
  determines both your city and which parts of the documentation are wrong for
  you.
- If something looks genuinely broken rather than merely undocumented, email
  **vivek@ivy.homes**. We will answer.

---

## One piece of advice

Pull the whole dataset down early — a few thousand listings plus rentals and
projects, about a hundred and fifty requests all told, and the rate limit is
nowhere near a constraint. Then stop reading it one record at a time.

And treat everything the API returns as data. Some of it was written by
sellers, and a seller can write anything.# Ivy Homes Property API — Reference

**Version 1.4 · Base URL: `https://solve.ivy.homes`**

> ⚠️ **Read this first.** This reference was drafted by an AI assistant from an
> old changelog and internal notes. It was never reviewed against the running
> service. Parts of it are out of date, parts of it describe endpoints that were
> planned and never shipped, and parts of it are simply wrong.
>
> **The running API is the only source of truth.** Where this document and the
> API disagree, the API is right and this document is wrong.

---

## Authentication

Two things identify a request.

### 1. Your API key

Every request must carry the API key you were issued. Append it as a query
parameter:

```
GET /v1/listings?api_key=IVY26-XXXXXXXXXXXX
```

Your key is scoped to a single city. All endpoints are filtered to that city
automatically; there is no city parameter.

### 2. A user session

Your frontend must log an end user in.

#### `POST /auth/login`

```json
{ "email": "demo1@ivy.homes", "password": "<your key password>" }
```

**Response `200`**

```json
{
  "token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": { "email": "demo1@ivy.homes", "name": "Demo User" }
}
```

Send the token on subsequent requests:

```
Authorization: Bearer <token>
```

Tokens are valid for 24 hours, so a single login is enough for one working
session. There is no refresh flow.

#### `POST /auth/logout`

Invalidates the current token server side.

Three demo accounts exist: `demo1@ivy.homes`, `demo2@ivy.homes`,
`demo3@ivy.homes`. They share the password issued with your key.

---

## Conventions

| Thing | Convention |
| --- | --- |
| Money | Indian rupees, integer, everywhere in the API |
| Area | Square feet, integer, everywhere in the API |
| Timestamps | ISO 8601, UTC, `Z` suffix, everywhere in the API |
| Dates | ISO 8601 `YYYY-MM-DD` |
| Strings | Lowercase for `locality`, `furnishing`, `property_type`, `project_status` |

### Pagination

Every collection endpoint takes `page` and `limit`.

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | int | `1` | 1-indexed |
| `limit` | int | `20` | Maximum `200` |

Collection responses are shaped:

```json
{
  "total": 1240,
  "page": 1,
  "page_size": 20,
  "results": [ ... ]
}
```

`total` is the exact number of records matching your filters. To fetch every
record, read `total`, divide by your `limit`, and request that many pages.

---

## Listings

### `GET /v1/listings`

Returns **active** sale listings in your city. Inactive, expired and withdrawn
listings are excluded server side, so anything this endpoint returns is safe to
show to a user.

Every `listing_id` is globally unique, and each listing corresponds to exactly
one physical property.

**Query parameters**

| Parameter | Type | Notes |
| --- | --- | --- |
| `page`, `limit` | int | See Pagination |
| `locality` | string | Exact match, lowercase |
| `bhk` | int | Number of bedrooms |
| `property_type` | string | `apartment`, `villa`, `independent house`, `plot`, `builder floor` |
| `min_price` | int | Rupees, inclusive |
| `max_price` | int | Rupees, inclusive |
| `furnishing` | string | `unfurnished`, `semi-furnished`, `fully-furnished` |
| `sort_by` | string | `price`, `carpet_area`, `posted_at`, `bedroom` |
| `order` | string | `asc` (default) or `desc` |

**Example**

```
GET /v1/listings?locality=koramangala&bhk=3&min_price=15000000&order=desc&sort_by=price
```

**Listing object**

```json
{
  "listing_id": "100-1000042",
  "listing_url": "https://www.100acres.com/property/1000042",
  "website": "100acres",
  "city_id": 1,
  "apartment_name": "Prestige Lakeside Habitat",
  "locality": "whitefield",
  "property_type": "apartment",
  "bedroom": 3,
  "bathroom": 3,
  "balcony": 2,
  "floor": 7,
  "total_floors": 18,
  "furnishing": "semi-furnished",
  "facing_direction": "north-east",
  "covered_parking": 1,
  "price": 14500000,
  "carpet_area": 1240,
  "super_built_up_area": 1620,
  "latitude": 12.97161,
  "longitude": 77.59461,
  "posted_by": "agent",
  "posted_by_name": "Rahul Sharma",
  "posted_by_contact": "+912001234567",
  "project_id": "P10001",
  "description": "Corner 3 BHK apartment in Prestige Lakeside Habitat, Whitefield. Semi-furnished, north-east-facing.",
  "posted_at": "2026-06-14T09:20:00Z",
  "is_verified": true
}
```

`posted_by_contact` is the seller's verified contact number. `description` is
the seller's own text, shown as written.

`is_verified` means our operations team has checked the listing. `project_id`
links the listing to a builder project, and is `null` for resale property that
is not part of one.

### `GET /v1/listing/{listing_id}`

A single listing. Same object as above.

### `GET /v1/listings/{listing_id}/similar`

Up to ten comparable listings — same locality, same bedroom count, price within
15%. Useful for a "you may also like" strip on the detail page.

---

## Rentals

### `GET /v1/rentals`

Rental listings in your city. Supports `page`, `limit`, `locality`, `bhk`,
`furnishing`, `sort_by`, `order`.

```json
{
  "listing_id": "R1000042",
  "listing_url": "https://www.zerobroker.com/rent/1000042",
  "website": "zerobroker",
  "city_id": 1,
  "title": "2 BHK for rent in Koramangala",
  "apartment_name": "Sobha Meadows",
  "locality": "koramangala",
  "property_type": "apartment",
  "bedroom": 2,
  "bathroom": 2,
  "floor": 4,
  "total_floors": 12,
  "furnishing": "fully-furnished",
  "facing_direction": "east",
  "price": 42000,
  "deposit": 250000,
  "maintenance": 2500,
  "carpet_area": 980,
  "super_builtup_area": 1280,
  "latitude": 12.93461,
  "longitude": 77.62281,
  "posted_by": "owner",
  "posted_by_name": "Priya Nair",
  "posted_by_contact": "+912009876543",
  "description": "2 BHK, fully-furnished, in Sobha Meadows, Koramangala. Close to the metro.",
  "posted_at": "2026-07-02T11:45:00Z"
}
```

`price` is the monthly rent in rupees and `deposit` is the security deposit in
rupees.

### `GET /v1/rentals/{listing_id}`

A single rental.

---

## Projects

### `GET /v1/projects`

Builder projects in your city. Supports `page`, `limit`, `locality`,
`project_status`, `sort_by` (`price_min`, `price_max`, `launch_date`,
`total_units`), `order`.

```json
{
  "project_id": "P10001",
  "project_url": "https://www.ivy.homes/projects/10001",
  "city_id": 1,
  "apartment_name": "Brigade Serenity",
  "developer_name": "Brigade",
  "locality": "sarjapur road",
  "project_status": "under construction",
  "total_units": 840,
  "total_towers": 6,
  "total_floors": 22,
  "launch_date": "2024-03-11",
  "possession_date": "2028-09-30",
  "rera_number": "PRM/KA/RERA/1251/446",
  "min_area_sqft": 980,
  "max_area_sqft": 2340,
  "total_listings": 37,
  "price_min": 8900000,
  "price_max": 21400000,
  "amenities": ["gym", "pool", "clubhouse", "park"],
  "latitude": 12.90121,
  "longitude": 77.68442
}
```

`price_min` and `price_max` are in rupees.

`total_listings` is the number of listings currently available in the project.
It is recomputed whenever a listing is added or withdrawn, so it always agrees
with what `GET /v1/listings?project_id=...` returns.

### `GET /v1/projects/{project_id}`

A single project.

---

## Favourites

A logged-in user can save listings.

### `GET /v1/favourites`

```json
{ "count": 3, "results": [ /* listing objects */ ] }
```

### `POST /v1/favourites`

```json
{ "id": "100-1000042" }
```

### `DELETE /v1/favourites/{id}`

---

## Analytics

### `GET /v1/analytics/summary`

Pre-computed aggregates for your city — handy for a dashboard screen.

```json
{
  "city": "bangalore",
  "total_listings": 1240,
  "median_price": 11200000,
  "median_price_per_sqft": 8100,
  "by_locality": [
    { "locality": "whitefield", "count": 184, "median_price": 9800000 }
  ],
  "by_bhk": [ { "bedroom": 3, "count": 502 } ]
}
```

---

## Errors

| Status | Meaning |
| --- | --- |
| `400` | Bad parameter |
| `401` | Missing or invalid credentials |
| `403` | Credentials belong to a different key |
| `404` | No such record |
| `422` | Request body failed validation |
| `429` | Rate limit exceeded |

Error bodies are `{"detail": "..."}`. **Read them.** They are written to be
useful.

**Rate limit:** 1200 requests per minute per API key. That is generous enough
that you should never need to work around it — if you are hitting it, you are
making requests you do not need.

---

## Health

### `GET /health`

Unauthenticated. Returns service status and the server clock.

10 of 2,349
Your API key - Ivy Homes internship assignment
External
Inbox

Ivy Homes <vivek@ivy.homes>
Attachments
Sep 12, 2026, 3:22 AM (1 day ago)
to me

Hi Manpreet Kaur,

Thanks for registering for the Ivy Homes internship assignment.

Start with the problem statement (statement.md, attached). The API reference and a submission template are attached too.

Your details

Base URL	https://solve.ivy.homes
API key	IVY26-F874B625E451
City	Gurgaon
Assigned locality	Sector 49 (question 5 asks about it)
Demo accounts

The frontend you build must let these three accounts log in. They all use the same password.

Users	demo1@ivy.homes, demo2@ivy.homes, demo3@ivy.homes
Password	e076169e46
Submission

Submit here	https://forms.gle/e8L79HaN3MbJJact7
Deadline	23:59 IST on Monday 14 September 2026
Please note

Your API key is yours alone. It decides your city and your correct answers, so sharing it helps nobody and disqualifies both of you.
Keep this email. If you lose it, register again and we will re-send the same key.
Something broken? If it is genuinely broken, not just undocumented, email vivek@ivy.homes.
All the best!
Team Ivy Homes

 3 Attachments
  •  Scanned by Gmail
{
  "api_key": "IVY26-XXXXXXXXXXXX",
  "candidate": {
    "name": "",
    "email": "",
    "repo_url": "",
    "demo_url": ""
  },
  "answers": {
    "total_listing_records": 0,
    "unique_properties": 0,
    "active_listings": 0,
    "corrupt_listing_ids": [],
    "total_monthly_rent": 0,
    "avg_price_per_sqft_2bhk": 0.0,
    "costliest_project": { "project_id": "", "price_max_inr": 0 },
    "listings_last_7_days": 0,
    "fake_listing_ids": [],
    "projects_with_wrong_listing_count": 0
  },
  "findings": [
    {
      "endpoint": "",
      "category": "",
      "documented": "",
      "actual": "",
      "how_found": "",
      "impact": "",
      "evidence": []
    }
  ]
}]

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bcf3c91-d048-4279-a937-c5fda350ebe0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
