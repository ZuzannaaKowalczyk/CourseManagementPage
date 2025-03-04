using System.Text.Json.Serialization;
namespace WebApiService.Models
{

    public class Student
    {
        public int StudentID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }

        [JsonIgnore]
        public ICollection<Registration>? Registrations { get; set; }

    }
}
