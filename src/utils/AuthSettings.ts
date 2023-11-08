import { ExtensionContext, SecretStorage } from "vscode";

export default class AuthSettings {
  private static _instance: AuthSettings;

  constructor(private secretStorage: SecretStorage) {}

  static init(context: ExtensionContext): void {
    AuthSettings._instance = new AuthSettings(context.secrets);
  }

  static get instance(): AuthSettings {
    return AuthSettings._instance;
  }

  async storeAuthData(token?: string): Promise<void> {
    if (token) {
      this.secretStorage.store("openapi_token", token);
    }
  }

  async getAuthData(): Promise<string | undefined> {
    return await this.secretStorage.get("openapi_token");
  }
  
  async deleteAuthData() {
    return await this.secretStorage.delete("openapi_token");
  }
}
