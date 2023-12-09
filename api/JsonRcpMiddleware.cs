using Newtonsoft.Json;

public class JsonRpcMiddleware
{
    private readonly RequestDelegate _next;

    public JsonRpcMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context, UserBridge userBridge)
    {
        if (context.Request.Path.StartsWithSegments("/apiv1"))
        {
            var requestBody = await new StreamReader(context.Request.Body).ReadToEndAsync();
            var rpcRequest = JsonConvert.DeserializeObject<JsonRpcRequest>(requestBody);


            var response = new JsonRpcResponse
            {
                Id = rpcRequest.Id,
                Result = await userBridge.GetAsync(1)
            };

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonConvert.SerializeObject(response));
        }
        else
        {
            await _next(context);
        }
    }
}

public class JsonRpcRequest
{
    public string Jsonrpc { get; set; }
    public string Method { get; set; }
    public string TypeName { get; set; }
    public object Params { get; set; }
    public int Id { get; set; }
}

public class JsonRpcResponse
{
    public int Id { get; set; }
    public object Result { get; set; }
}