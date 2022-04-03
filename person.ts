export class Person {
  // publicはアクセスの制約がない。省略できる。
  public name: string
  // クラス内部からのみアクセスできる
  private age: number
  // 継承した子クラスからもアクセスできる
  protected nationality: string

  constructor(name: string, age: number, nationality: string) {
    this.name = name
    this.age = age
    this.nationality = nationality
  }

  profile(): string {
    // ageはprivateなのでクラス内部のみアクセスできる
    return `name: ${this.name} age: ${this.age}`
  }
}