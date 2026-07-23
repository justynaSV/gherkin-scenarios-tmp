import { setWorldConstructor, World } from '@cucumber/cucumber';

type LoginCredentials = {
  username: string;
  password: string;
};

type TestUsers = {
  valid: LoginCredentials;
};

type AppDriver = {
  openLoginPage(): Promise<void>;
  login(credentials: LoginCredentials): Promise<unknown>;
  currentPage(): Promise<string>;
  errorMessage(): Promise<string>;
};

export class CustomWorld extends World {
  app!: AppDriver;
  loginResponse?: unknown;
  testUsers: TestUsers = {
    valid: {
      username: 'test-user',
      password: 'safe-example-password'
    }
  };
}

setWorldConstructor(CustomWorld);
