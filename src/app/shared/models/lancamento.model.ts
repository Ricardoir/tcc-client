export class Lancamento {
  constructor(
    public data: string,
    public tipo: string,
    public localizacao: string,
    public descricao: string,
    public funcionarioId: string,
    public id?: string
  ) {}
}
