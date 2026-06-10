# Firestore Security Specification - YouTube Channel Marketplace

## 1. Data Invariants
- YouTube channel listings can only be created, edited, and deleted by authorized Administrators.
- A public user can read channels, testimonials, and status stats, but can never edit or delete them.
- Any write to listings must enforce schema validation, including positive integer parameters for subscribers, views, and revenue, and correct status boundaries ("available" / "sold").
- The registered User email `djdas000000@gmail.com` is bootstrapped as the default Administrator. Only a verified Google Auth token matching this email or explicitly present in the `admins` collection can execute write operations.

## 2. The "Dirty Dozen" Payloads (Attacks Matrix)
1. **Self-Elevated Admin Role**: Attempt to create an admin record on `/admins/my_uid` from an anonymous or non-whitelisted email.
2. **Unverified Email Edit**: Log in with spoofed `email: djdas000000@gmail.com` but with `email_verified: false` to modify listings.
3. **Ghost Property Injection**: Creating a listing with a secret ghost property `isMock: true` to bypass strict key matching rules.
4. **Invalid Status Transition**: Attempt to set a channel status to "auctioning" or other unsupported string values.
5. **No-Price Listing**: Attempt to create a channel listing without a pricing property.
6. **Denial of Wallet (ID Poisoning Challenge)**: Try to write with a massive id or 10MB string as the Document ID path variable to exhaust memory or indexes.
7. **Bypassing WHATSAPP Number Boundary**: Try to set a whatsapp number of 5000 words.
8. **Impersonating Timestamp**: Attempt to set a custom historical `updatedAt` instead of relying on `request.time`.
9. **Modifying Immortal Fields**: Make a channel write that changes the immutable `createdAt` property.
10. **Testimonial Fake Spawning**: Unauthenticated user trying to populate synthetic reviews to `/testimonials/fake_id`.
11. **Altering Singleton Stats**: Unauthenticated user writing custom stats to `/stats/summary`.
12. **Blind Collection Harvesting**: Scrape database through lists without target filters.

## 3. Test Cases (Simulated validation)
Our security rules strictly cover these cases to prevent unauthorized CRUD operations. We are going to deploy the Firestore Rules directly in the next step.
