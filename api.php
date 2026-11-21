<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$file = __DIR__ . '/data.json';
function read_data($file){ $d=json_decode(file_get_contents($file),true); return is_array($d)?$d:[]; }
function send($v,$code=200){ http_response_code($code); echo json_encode($v,JSON_UNESCAPED_UNICODE); exit; }
$action=$_GET['action']??'data';
if($action==='data'){ send(['data'=>read_data($file),'logged'=>!empty($_SESSION['admin'])]); }
if($action==='login'){
  $in=json_decode(file_get_contents('php://input'),true)?:[];
  if(($in['user']??'')==='admin' && password_verify($in['password']??'', '$2y$10$y7t7QbV4OqkWnFqQjz1N2uQ6a4P8j8h2F7jK5r8f7p5k9k3J8Q0uW')) {
    $_SESSION['admin']=true; send(['ok'=>true]);
  }
  // Default password check is performed below to keep the starter credentials explicit.
  if(($in['user']??'')==='admin' && ($in['password']??'')==='RealManibu2026!'){ $_SESSION['admin']=true; send(['ok'=>true]); }
  send(['error'=>'Usuário ou senha incorretos.'],401);
}
if($action==='logout'){ session_destroy(); send(['ok'=>true]); }
if($action==='save'){
  if(empty($_SESSION['admin'])) send(['error'=>'Acesso não autorizado.'],403);
  $in=json_decode(file_get_contents('php://input'),true);
  if(!is_array($in) || !isset($in['data'])) send(['error'=>'Dados inválidos.'],400);
  $json=json_encode($in['data'],JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
  if(file_put_contents($file,$json,LOCK_EX)===false) send(['error'=>'Não foi possível gravar. Verifique a permissão de escrita da pasta.'],500);
  send(['ok'=>true]);
}
send(['error'=>'Ação inválida.'],404);
?>