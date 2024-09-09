class MetaDto {
  symbol: string;
}

export class LogoResponseDto {
  meta: MetaDto;

  url?: string;

  logo_base?: string;

  logo_quote?: string;
}
