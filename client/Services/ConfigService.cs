using Camera_Client.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Camera_Client.Services
{
    class ConfigService
    {
        private static HttpClient _client = new HttpClient();

        public static async Task<CameraConfig> GetConfig(string host)
        {
            HttpResponseMessage response = await _client.GetAsync(host + "/info");
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<CameraConfig>(responseBody);
        }

        public static async Task<List<WifiItem>> GetWifi(string host)
        {
            HttpResponseMessage response = await _client.GetAsync(host + "/wifi/scan");
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<List<WifiItem>>(responseBody);
        }

        public static async Task UpdateHostname(string host, string hostname)
        {
            using (var content = new StringContent(JsonConvert.SerializeObject(new { hostname }), System.Text.Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _client.PostAsync(host + "/hostname/update", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                try
                {
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception e)
                {
                    var res = JsonConvert.DeserializeObject<ErrorMessage>(responseBody);
                    throw new Exception(res.message);
                }
            }
        }
        public static async Task ConnectWifi(string host, string ssid, string password)
        {
            using (var content = new StringContent(JsonConvert.SerializeObject(new { ssid, password }), System.Text.Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _client.PostAsync(host + "/wifi/connect", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                try
                {
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception e)
                {
                    var res = JsonConvert.DeserializeObject<ErrorMessage>(responseBody);
                    throw new Exception(res.message);
                }
            }
        }

        internal static async Task Authenticate(string host, string token)
        {
            using (var content = new StringContent(JsonConvert.SerializeObject(new { token }), System.Text.Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _client.PostAsync(host + "/integration/auth-token", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                try
                {
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception e)
                {
                    var res = JsonConvert.DeserializeObject<ErrorMessage>(responseBody);
                    throw new Exception(res.message);
                }
            }
        }

        internal static async Task UpdateConfig(string host, CameraConfig config)
        {
            using (var content = new StringContent(JsonConvert.SerializeObject(config), System.Text.Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _client.PostAsync(host + "/config", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                try
                {
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception e)
                {
                    var res = JsonConvert.DeserializeObject<ErrorMessage>(responseBody);
                    throw new Exception(res.message);
                }
            }
        }
    }
}
