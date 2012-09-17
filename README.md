Simple-Send v1.0
---

Just a fun little coding exercise to use the MailChimp Mandrill API to
send an email from a completely client-side web app (even with the
encoded PDF).

It's just a demo, so I didn't spend a ton of time making it robust
(YMMV).

### Assumptions

- The attachment expects a remotely-hosted file ending in `.pdf`.
- You're a mostly sane user.

### Known Limitations

- No tests.
- Input isn't currently validated.
- Sometimes has cross-origin issues (particularly with HTTPS on the PDF).
