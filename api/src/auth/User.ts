export default class User {
  public id: string;
  public email: string;

  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }

  public static fromIdToken(decodedJwt: any) {
    const id = decodedJwt.sub;
    const email = decodedJwt.email;

    return new User(id, email);
  }
}
