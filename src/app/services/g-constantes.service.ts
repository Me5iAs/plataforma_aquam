const base = "http://localhost/aquam/";
// const base = "backend/";
// const base = "https://aquam.pe/backend/";
// 
export class gConstantesService {    

  // Service 
  public static gServiceUrl : string =  base +  "gQuery.php";
  
  // Autenticidad
  public static gAuthUrl: string = base + "gSesions.php"

  // subir
  public static gSubirUrl: string = base +  "subirArchivo.php";

  // imagenes base 
  public static gBaseUrl: string = base;

  // archivos de clientes
  public static gImagenesClientes: string = base +  "Clientes/";

  // archivos en general
  public static gImagenesArchvos: string = base +  "Archivos/";
  
  // archivos de pago
  public static gImagenesPagos: string = base +  "Pagos/";
  
  // archivos de pago
  public static gImageneUsuarios: string = base +  "Usuarios/";

} 
