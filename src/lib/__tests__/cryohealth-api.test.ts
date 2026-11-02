import { registerPushDevice } from "../cryohealth-api";
import { apiFetch } from "../api-client";
import { useAuthStore } from "../../state/auth";

jest.mock("../api-client", () => ({ apiFetch: jest.fn() }));
jest.mock("../../state/auth", () => ({
  useAuthStore: { getState: jest.fn() },
}));

const request = apiFetch as jest.Mock;
const authState = useAuthStore.getState as jest.Mock;

beforeEach(() => {
  request.mockReset().mockResolvedValue({ registered: true });
  authState.mockReset();
});

describe("registerPushDevice", () => {
  it("keeps guest registration public and does not link a guest token", async () => {
    authState.mockReturnValue({ token: null });

    await expect(
      registerPushDevice("device-token", "android"),
    ).resolves.toEqual({ registered: true });

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      "/push/devices",
      expect.objectContaining({ auth: false }),
    );
  });

  it("registers an authenticated device against its user for scoped alert routing", async () => {
    authState.mockReturnValue({ token: "jwt", role: "chw" });

    await registerPushDevice("device-token", "android");

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      "/push/devices/for-user",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: expect.objectContaining({
          token: "device-token",
          platform: "android",
        }),
      }),
    );
  });

  it("keeps authenticated users without a downstream role unscoped", async () => {
    authState.mockReturnValue({ token: "jwt", role: "viewer" });

    await registerPushDevice("device-token", "android");

    expect(request).toHaveBeenCalledWith(
      "/push/devices",
      expect.objectContaining({ auth: false }),
    );
  });
});
