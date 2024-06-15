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
    public class ScheduleService
    {
        private static HttpClient _client = new HttpClient();

        public static async Task<List<ScheduledRecord>> GetSchedules(string host)
        {
            HttpResponseMessage response = await _client.GetAsync(host + "/schedules");
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<List<ScheduledRecord>>(responseBody);
        }
        public static async Task<ScheduledRecord> GetScheduleTemplate(string host)
        {
            HttpResponseMessage response = await _client.GetAsync(host + "/schedule/template");
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<ScheduledRecord>(responseBody);
        }
        public static async Task<ScheduledRecord> PutSchedule(string host, ScheduledRecord record)
        {
            using (var content = new StringContent(JsonConvert.SerializeObject(record), System.Text.Encoding.UTF8, "application/json"))
            {
                HttpResponseMessage response = await _client.PostAsync(host + "/schedules", content);
                string responseBody = await response.Content.ReadAsStringAsync();

                try
                {
                    response.EnsureSuccessStatusCode();
                } catch (Exception e)
                {
                    var res = JsonConvert.DeserializeObject<ErrorMessage>(responseBody);
                    throw new Exception(res.message);
                }

                return JsonConvert.DeserializeObject<ScheduledRecord>(responseBody);
            }
        }

        internal static async Task DeleteSchedule(string host, ScheduledRecord record)
        {
            HttpResponseMessage response = await _client.DeleteAsync(host + "/schedule/" + record._id);
            response.EnsureSuccessStatusCode();

            return;
        }
    }
}
