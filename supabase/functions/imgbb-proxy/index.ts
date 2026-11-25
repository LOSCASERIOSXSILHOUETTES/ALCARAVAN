import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    if (!image || typeof image !== 'string') {
      throw new Error('Imagen requerida en base64')
    }

    const keysString = Deno.env.get('IMGBB_API_KEYS')
    if (!keysString) {
      throw new Error('IMGBB_API_KEYS no configurada en Supabase')
    }

    const apiKeys = keysString.split(',').map((k) => k.trim()).filter((k) => k.length > 0)
    if (apiKeys.length === 0) {
      throw new Error('No hay API Keys disponibles en la variable IMGBB_API_KEYS')
    }

    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)]

    const formData = new FormData()
    formData.append('image', image)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${randomKey}`, {
      method: 'POST',
      body: formData,
    })

    const result = await imgbbResponse.json()

    if (!result.success) {
      throw new Error(result.error?.message || 'Error desconocido de ImgBB')
    }

    return new Response(
      JSON.stringify({ url: result.data.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('imgbb-proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
