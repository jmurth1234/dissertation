using Camera_Client.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Camera_Client.Models
{
    public class CameraItem
    {
        public string Url { get; set; }
        public string Id { get; set; }
        public string Name { get; set; }
        public CameraConfig Config { get; set; }

        public string Image => $"{Url}/image";
        public string Video => $"{Url}/live";

        public override string ToString()
        {
            return $"{Config.cameraName} ({Name})";
        }

        public override bool Equals(object obj)
        {
            if (!(obj is CameraItem))
            {
                return false;
            }

            var other = obj as CameraItem;

            return other.Id == this.Id;
        }

        public override int GetHashCode()
        {
            int hashCode = 1790627994;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Url);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Id);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Name);
            return hashCode;
        }
    }
}
