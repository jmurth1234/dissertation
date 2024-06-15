using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Camera_Client.Models
{
    public class WifiItem
    {
        public string ssid { get; set; }

        public override string ToString()
        {
            return ssid;
        }
    }
}
