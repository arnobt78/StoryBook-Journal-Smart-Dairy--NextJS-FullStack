import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OAuthReturnSync } from "@/components/auth/OAuthReturnSync";
import { OAUTH_PENDING_KEY, OAUTH_VARIANT_KEY } from "@/constants/auth";
import { notifyJournalCacheUpdated } from "@/lib/journal-cache-notify";
import { appToast } from "@/lib/app-toast";

vi.mock("@/lib/journal-cache-notify", () => ({
  notifyJournalCacheUpdated: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/app-toast", () => ({
  appToast: {
    auth: {
      welcomeBack: vi.fn(),
      registered: vi.fn(),
    },
  },
}));

function renderSync(displayName = "Reader") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OAuthReturnSync displayName={displayName} />
    </QueryClientProvider>,
  );
  return queryClient;
}

describe("OAuthReturnSync", () => {
  beforeEach(() => {
    vi.mocked(notifyJournalCacheUpdated).mockClear();
    vi.mocked(appToast.auth.welcomeBack).mockClear();
    vi.mocked(appToast.auth.registered).mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does nothing when oauth pending flag is absent", () => {
    renderSync();
    expect(appToast.auth.welcomeBack).not.toHaveBeenCalled();
    expect(notifyJournalCacheUpdated).not.toHaveBeenCalled();
  });

  it("shows welcomeBack and invalidates once on login OAuth return", () => {
    localStorage.setItem(OAUTH_PENDING_KEY, "true");
    localStorage.setItem(OAUTH_VARIANT_KEY, "login");
    const qc = renderSync("Jane");

    expect(appToast.auth.welcomeBack).toHaveBeenCalledWith("Jane");
    expect(appToast.auth.registered).not.toHaveBeenCalled();
    expect(notifyJournalCacheUpdated).toHaveBeenCalledWith(qc);
    expect(localStorage.getItem(OAUTH_PENDING_KEY)).toBeNull();
    expect(localStorage.getItem(OAUTH_VARIANT_KEY)).toBeNull();
  });

  it("shows registered toast when variant is register", () => {
    localStorage.setItem(OAUTH_PENDING_KEY, "true");
    localStorage.setItem(OAUTH_VARIANT_KEY, "register");
    renderSync("Writer");

    expect(appToast.auth.registered).toHaveBeenCalledWith("Writer");
    expect(appToast.auth.welcomeBack).not.toHaveBeenCalled();
  });

  it("runs only once per mount even if effect re-runs", () => {
    localStorage.setItem(OAUTH_PENDING_KEY, "true");
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <OAuthReturnSync displayName="Jane" />
      </QueryClientProvider>,
    );
    rerender(
      <QueryClientProvider client={qc}>
        <OAuthReturnSync displayName="Jane" />
      </QueryClientProvider>,
    );

    expect(appToast.auth.welcomeBack).toHaveBeenCalledTimes(1);
    expect(notifyJournalCacheUpdated).toHaveBeenCalledTimes(1);
  });
});
