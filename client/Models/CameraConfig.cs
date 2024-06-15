using Camera_Client.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

#pragma warning disable IDE1006 // Naming Styles

namespace Camera_Client.Models
{
    public class CameraConfig : BasePropertyItem
    {
        private string _integration;
        public string integration
        {
            get => _integration;
            set => Set(ref _integration, value);
        }

        private string _cameraName;
        public string cameraName
        {
            get => _cameraName;
            set => Set(ref _cameraName, value);
        }

        private string _email;
        public string email
        {
            get => _email;
            set => Set(ref _email, value);
        }

        private bool _needsAuth;
        public bool needsAuth
        {
            get => _needsAuth;
            set => Set(ref _needsAuth, value);
        }

        public string hostName { get; set; }
    }
}
