import {
  signInWithPassword,
  signUpWithPassword,
  refreshSession,
  SUPABASE_PUBLISHABLE_KEY,
} from "../supabase-auth";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("signInWithPassword() parses Supabase session and sends publishable apikey", async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      access_token: "acc-123",
      refresh_token: "ref-456",
      expires_in: 3600,
      user: { id: "user-1", email: "test@example.com" },
    }),
  });
  globalThis.fetch = mockFetch as unknown as typeof fetch;

  const result = await signInWithPassword("test@example.com", "secret123");
  expect(result.ok).toBe(true);
  if (result.ok && result.status === "SIGNED_IN") {
    expect(result.session.accessToken).toBe("acc-123");
    expect(result.session.refreshToken).toBe("ref-456");
    expect(result.session.user.email).toBe("test@example.com");
  }

  const [, init] = mockFetch.mock.calls[0];
  expect(init.headers.apikey).toBe(SUPABASE_PUBLISHABLE_KEY);
});

test("signUpWithPassword() returns CONFIRM_EMAIL when Supabase requires email verification", async () => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      id: "user-2",
      email: "new@example.com",
    }),
  }) as unknown as typeof fetch;

  const result = await signUpWithPassword("new@example.com", "secret123");
  expect(result).toEqual({
    ok: true,
    status: "CONFIRM_EMAIL",
    email: "new@example.com",
  });
});

test("refreshSession() returns null on HTTP error", async () => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({ error_description: "Invalid Refresh Token" }),
  }) as unknown as typeof fetch;

  expect(await refreshSession("bad-token")).toBeNull();
});
