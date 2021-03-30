import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router } from '@angular/router';

import {
  Tipo,
  LancamentoService,
  Lancamento,
  HttpUtilService
} from '../../../shared';

import * as moment from 'moment';

declare var navigator: any;

@Component({
  selector: 'app-lancamento',
  templateUrl: './lancamento.component.html',
  styleUrls: ['./lancamento.component.css']
})
export class LancamentoComponent implements OnInit {

  form:FormGroup;
  private dataAtualEn: string;
  dataAtual: string;
  geoLocation: string;
  ultimoTipoLancado: string;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private httpUtil: HttpUtilService,
    private lancamentoService: LancamentoService) { }

  ngOnInit() {
    this.form = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(85)]]
    });
  	this.dataAtual = moment().format('DD/MM/YYYY HH:mm:ss');
  	this.dataAtualEn = moment().format('YYYY-MM-DD HH:mm:ss');
  	this.obterGeoLocation();
    this.ultimoTipoLancado = '';
    this.obterUltimoLancamento();
  }

  get descricao() : string {
    return this.form.get('descricao').value;
  }



  obterGeoLocation(): string {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position =>
        	this.geoLocation = `${position.coords.latitude},${position.coords.longitude}`);
    }
    return '';
  }

  iniciarTrabalho() {
    this.cadastrar(Tipo.INICIO_TRABALHO);
  }

  terminarTrabalho() {
    this.cadastrar(Tipo.TERMINO_TRABALHO);
  }

  iniciarAlmoco() {
    this.cadastrar(Tipo.INICIO_ALMOCO);
  }

  terminarAlmoco() {
    this.cadastrar(Tipo.TERMINO_ALMOCO);
  }

  obterUltimoLancamento() {
    this.lancamentoService.buscarUltimoTipoLancado()
      .subscribe(
        data => {
          this.ultimoTipoLancado = data.data ? data.data.tipo : '';
        },
        err => {
          const msg: string = "Erro obtendo último lançamento.";
          this.snackBar.open(msg, "Erro", { duration: 5000 });
        }
      );
  }

  cadastrar(tipo: Tipo) {

    if(this.form.invalid) {
      return;
    }

  	const lancamento: Lancamento = new Lancamento(
      this.dataAtualEn,
      tipo,
      this.geoLocation,
      this.descricao,
      this.httpUtil.obterIdUsuario()
    );

    this.lancamentoService.cadastrar(lancamento)
      .subscribe(
        data => {
          const msg: string = "Lançamento realizado com sucesso!";
          this.snackBar.open(msg, "Sucesso", { duration: 5000 });
          this.router.navigate(['/funcionario/listagem']);
        },
        err => {
          let msg: string = "Tente novamente em instantes.";
          if (err.status == 400) {
            msg = err.error.errors.join(' ');
          }
          this.snackBar.open(msg, "Erro", { duration: 5000 });
        }
      );
  }

  obterUrlMapa(): string {
  	return "https://www.google.com/maps/search/?api=1&query=" +
  		this.geoLocation;
  }

  exibirInicioTrabalho(): boolean {
  	return this.ultimoTipoLancado == '' ||
  		this.ultimoTipoLancado == Tipo.TERMINO_TRABALHO;
  }

  exibirTerminoTrabalho(): boolean {
  	return this.ultimoTipoLancado == Tipo.INICIO_TRABALHO ||
  		this.ultimoTipoLancado == Tipo.TERMINO_ALMOCO;
  }

  exibirInicioAlmoco(): boolean {
  	return this.ultimoTipoLancado == Tipo.INICIO_TRABALHO;
  }

  exibirTerminoAlmoco(): boolean {
  	return this.ultimoTipoLancado == Tipo.INICIO_ALMOCO;
  }

}







