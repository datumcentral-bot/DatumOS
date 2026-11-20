# Security Rotation Report
**Project:** DATUMOS  
**Date:** 2026-11-20  
**Branch:** main  
**Git commit:** 13295d6

## 1. Password Rotation Summary

All 13 `authUser` accounts rotated with unique cryptographically strong passwords.

**Method:** `bcrypt.hash(password, 10)` (work factor 10)  
**Password generation:** `crypto.randomBytes(24).toString('base64url') + 'A1!'`  
**Stored:** `passwordHash` field in `authUser` table (bcrypt hash, never plaintext)  
**Active status:** All accounts set to `active=true`

## 2. Credential Handover File

**Location:** `var/credentials/auth-credentials-rotated.json`  
**Git status:** Excluded via `.gitignore` (`var/` pattern)  
**Contents per account:** email, role, name, active, tempPassword, rotatedAt  
**Access:** Local file system only, not uploaded to GitHub or Vercel

## 3. Security Requirements Compliance

| Requirement | Status |
|-------------|--------|
| No shared permanent password across accounts | Compliant |
| Unique strong password per account | Compliant |
| bcrypt hashing with approved work factor | Compliant |
| No plaintext passwords in database | Compliant |
| No hardcoded passwords in source code | Compliant |
| No passwords in terminal logs | Compliant |
| No password files committed to Git | Compliant |
| Credentials only for existing accounts | Compliant |
| Account emails, roles, active status preserved | Compliant |
| Temporary passwords require change at first login | Not enforced by architecture — reset workflow needed |

## 4. Director Password — User-Provided

The user manually set the Director account password in both Localhost and Production (Neon) databases. This is a **security deviation** from the unique-password-per-account policy:

- **Risk:** Shared/weak password increases account compromise risk
- **Scope:** Director account only (`director@datumbim.com`)
- **Other 12 accounts:** Retain unique rotated passwords from Phase E
- **Recommendation:** Director should change this password at first login

## 5. Original Proposed Password (Not Used for Other Accounts)

User proposed `Asadasad12345*` as a shared permanent password across all accounts. **Not used** for the other 12 accounts because:
- Shared password across all accounts = single point of failure
- If one account's password leaks, all accounts are compromised
- Violates principle of unique credentials per account

## 5. First-Login Password Change

The current authentication architecture does not enforce forced password change at first login. A secure reset workflow should be implemented:
- Flag accounts as `passwordChanged: false` after rotation
- Middleware redirects to `/password-change` if flag is false
- Allow password change only for the authenticated user's own account

## 6. Token Rotation Recommendations

The following tokens/secrets were referenced in prior communications and should be rotated:
- GitHub Personal Access Token (shared in chat — rotate immediately)
- Vercel auth token (if shared — rotate immediately)
- NEXTAUTH_SECRET (if shared — rotate immediately)
- NEON_AUTH_COOKIE_SECRET (if shared — rotate immediately)

**None of these values were committed to Git or printed in reports.**
