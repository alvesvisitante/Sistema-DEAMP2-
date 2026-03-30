const API = "http://127.0.0.1:3000"

async function request(url:string, options?:RequestInit){
const token = localStorage.getItem("token")

const res = await fetch(`${API}${url}`, {
  ...options,
  headers:{
    "Content-Type":"application/json",
    Authorization: token ? `Bearer ${token}` : ""
  }
  
})
  if(!res.ok){
    const text = await res.text()
    throw new Error(text || "Erro na requisição")
  }

  if(res.status === 204) return null
  return res.json()
}

export const api = {

  // ================= AGENTES =================

  listarAgentes(){
    return request("/agentes")
  },

  criarAgente(data:any){
    return request("/agentes",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(data)
    })
  },

  atualizarAgente(id:string,data:any){
    return request(`/agentes/${id}`,{
      method:"PUT",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(data)
    })
  },

  deletarAgente(id:string){
    return request(`/agentes/${id}`,{
      method:"DELETE"
    })
  },

  // ================= INTIMAÇÕES =================

  listarIntimacoes(){
    return request("/intimacoes")
  },

  buscarIntimacao(id:string){
    return request(`/intimacoes/${id}`)
  },

  criarIntimacao(data:any){
    return request("/intimacoes",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(data)
    })
  },

  atualizarIntimacao(id:string,data:any){
    return request(`/intimacoes/${id}`,{
      method:"PUT",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify(data)
    })
  },

  deletarIntimacao(id:string){
    return request(`/intimacoes/${id}`,{
      method:"DELETE"
    })
  }
}