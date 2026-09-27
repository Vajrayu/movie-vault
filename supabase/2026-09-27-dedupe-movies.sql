-- One-off cleanup of duplicate rows in `movies` (generated 2026-09-27 from a snapshot of 538 rows).
-- 102 duplicate groups, 107 rows removed. In each group the row with the most
-- of your data (watched / rating / notes / metadata) is kept, and any empty fields are filled in from its copies.
-- Run the whole file in Supabase > SQL Editor. It runs as one transaction, so if any statement fails nothing changes.

begin;

-- Blade Runner (1982): keep 2045, delete 2501
-- Hacksaw Ridge (2016): keep 2087, delete 2506
-- I Want to Eat Your Pancreas (2018): keep 2091, delete 2498
-- Jolly LLB 3 (2025): keep 2101, delete 2507
-- L.A. Confidential (1997): keep 2118, delete 2212
-- Laapataa Ladies (2024): keep 2119, delete 2213
-- Lucky Baskhar (2024): keep 2120, delete 2224
-- Maharaja (2024): keep 2121, delete 2227, 2514
-- Memories of Murder (2003): keep 2122, delete 2232
-- Million Dollar Arm (2014): keep 2123, delete 2233
-- Million Dollar Baby (2004): keep 2124, delete 2234
-- Minnal Murali (2021): keep 2125, delete 2235
-- Mirai (2025): keep 2126, delete 2236
-- Modern Family (2009) (2009): keep 2127, delete 2237
-- Moneyball (2011): keep 2128, delete 2238
-- My Neighbor Totoro (1988): keep 2129, delete 2247
-- Naruto (2002) (2002): keep 2130, delete 2249
-- Naruto Shippuden (2007): keep 2131, delete 2250
-- Notting Hill (1999): keep 2132, delete 2254
-- Oceans 11 (2013): keep 2133, delete 2256
-- Oceans 12 (2004): keep 2134, delete 2257
-- Oceans 13 (2007): keep 2135, delete 2258
-- ODDTAXI (2021): keep 2136, delete 2260
-- Once Upon a time in hollywood (2019): keep 2137, delete 2264
-- One Punch Man (2015): keep 2138, delete 2266
-- Oppenheimer (2023): keep 2139, delete 2268
-- Paprika (2006): keep 2140, delete 2270
-- Predestination (2014): keep 2141, delete 2277, 2517
-- Pulp Fiction (1994): keep 2142, delete 2282
-- Puss in Boots (2011): keep 2143, delete 2283
-- Raid 2 (2025): keep 2144, delete 2287
-- Ratatouille (2007): keep 2145, delete 2289
-- Ready Player One (2018): keep 2146, delete 2290
-- Real Steel (2011): keep 2147, delete 2291
-- Reservoir Dogs (1992): keep 2148, delete 2294
-- Rocky (1976): keep 2149, delete 2296
-- Saving Private Ryan (1998): keep 2150, delete 2299
-- Se7en (1995): keep 2151, delete 2303
-- Shaolin Soccer (2001): keep 2152, delete 2306
-- Shazam (2019): keep 2153, delete 2307
-- Shrek (2001): keep 2154, delete 2309
-- Shutter Island (2010): keep 2155, delete 2314  <-- ratings differ: kept 2, deleted row had 7
-- Soul (2020): keep 2156, delete 2321
-- Spider-Man: No Way Home (2021): keep 2157, delete 2322
-- Spirited Away (2001): keep 2158, delete 2323
-- Stand and Deliver (1988): keep 2159, delete 2326
-- Stand by Me (1986): keep 2160, delete 2327
-- Stranger Things (2016): keep 2161, delete 2336
-- sully (2016) (2016): keep 2162, delete 2337
-- Tenet (2020): keep 2163, delete 2341
-- The Bad Guys (2022): keep 2164, delete 2348
-- The Big Short (2015) (2015): keep 2165, delete 2351
-- The Bourne Identity (2002): keep 2166, delete 2352, 2522
-- The Curious Case of Benjamin Buttons (2008) (2008): keep 2167, delete 2357
-- The Dark Knight (2008): keep 2168, delete 2358
-- The Dark Knight Rises (2012): keep 2169, delete 2359
-- The Departed (2006): keep 2170, delete 2360
-- The Dictator (2012): keep 2171, delete 2361
-- The Exorcist (1973): keep 2172, delete 2363
-- The Fantastic 4: First Steps (2025): keep 2173, delete 2364
-- The girl who leapt through time (2006): keep 2174, delete 2368
-- The Girl with the Dragon Tattoo (2011): keep 2175, delete 2369
-- The Godfather (1972): keep 2176, delete 2370
-- The Godfather Part 2 (1974): keep 2177, delete 2371
-- The Grand Tour TV (2016) (no year): keep 2178, delete 2375
-- The Incredibles (2004): keep 2179, delete 2382
-- The Intouchables (2011): keep 2180, delete 2383
-- The Invisible Guest (2017): keep 2181, delete 2384
-- The Lincoln Lawyer (2011): keep 2182, delete 2389
-- The Prestige (2006): keep 2183, delete 2400
-- The Silence of the Lambs (1991): keep 2184, delete 2403
-- The Sixth Sense (1999): keep 2185, delete 2404
-- The Social Network (2010): keep 2186, delete 2406
-- The Terminal (2004) (2004): keep 2187, delete 2410
-- The Thomas Crown Affair (1999) (1999): keep 2188, delete 2413
-- The Thursday Murder Club (2025): keep 2189, delete 2414
-- The Truman Show (1998): keep 2190, delete 2415
-- The Usual Suspects (1995): keep 2191, delete 2417
-- The Wild Robot (2024): keep 2192, delete 2418, 2524
-- The Wolf of Wall Street (2013): keep 2193, delete 2419
-- Top Gear (2002) (2002): keep 2194, delete 2422
-- Top Gun (1986): keep 2195, delete 2423
-- Top Gun: Maverick (2022): keep 2196, delete 2424
-- Toy Story (1995): keep 2197, delete 2425
-- Toy Story 2 (1999): keep 2198, delete 2426
-- Toy Story 3 (2010): keep 2199, delete 2427
-- Toy Story 4 (2019): keep 2200, delete 2428
-- Tropic Thunder (2008): keep 2201, delete 2430
-- Up (2009): keep 2202, delete 2436
-- Vikram Vedha (2017): keep 2203, delete 2441
-- Vishwaroopam (2013): keep 2204, delete 2442
-- WALL·E (2008): keep 2205, delete 2443
-- War Dogs (2016): keep 2206, delete 2444, 2526
-- Whiplash (2014): keep 2207, delete 2446
-- Who Framed Roger Rabbit (1988): keep 2208, delete 2447
-- Your Name. (2016): keep 2209, delete 2451
-- Zodiac (2007): keep 2210, delete 2452
-- Zootopia (2016): keep 2211, delete 2453
-- Léon: The Professional (1994): keep 2216, delete 2510
-- The Big Lebowski (1998): keep 2350, delete 2512
-- The Good, the Bad and the Ugly (1966): keep 2373, delete 2544
update movies set tmdb_id = 429, created_at = '2026-06-22T11:11:22.431' where id = 2373;
-- Dallas Buyers Club (2013): keep 2465, delete 2527

delete from movies where id in (2501, 2506, 2498, 2507, 2212, 2213, 2224, 2227, 2514, 2232, 2233, 2234, 2235, 2236, 2237, 2238, 2247, 2249, 2250, 2254, 2256, 2257, 2258, 2260, 2264, 2266, 2268, 2270, 2277, 2517, 2282, 2283, 2287, 2289, 2290, 2291, 2294, 2296, 2299, 2303, 2306, 2307, 2309, 2314, 2321, 2322, 2323, 2326, 2327, 2336, 2337, 2341, 2348, 2351, 2352, 2522, 2357, 2358, 2359, 2360, 2361, 2363, 2364, 2368, 2369, 2370, 2371, 2375, 2382, 2383, 2384, 2389, 2400, 2403, 2404, 2406, 2410, 2413, 2414, 2415, 2417, 2418, 2524, 2419, 2422, 2423, 2424, 2425, 2426, 2427, 2428, 2430, 2436, 2441, 2442, 2443, 2444, 2526, 2446, 2447, 2451, 2452, 2453, 2510, 2512, 2544, 2527);

-- Expect 431:
select count(*) from movies;

-- Stop duplicates coming back. The app already checks tmdb_id before adding, these make the database enforce it.
create unique index if not exists movies_tmdb_id_unique on movies (tmdb_id) where tmdb_id is not null;
create unique index if not exists movies_title_year_unique on movies (lower(title), year);

commit;
