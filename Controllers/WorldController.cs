using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using VillagesLibrary;

namespace Villages
{
    public class WorldController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public HttpResponseMessage Get(int id)
        {
            GraphRepository repo = new GraphRepository();
            string cypher = string.Format("MATCH (w:World)<-[parent*]-(s:Shape)-[edge*]->(p) where ID(w) = {0} RETURN w,s,p,edge,parent", id);
            var response = repo.Get(cypher);
            return Request.CreateResponse(HttpStatusCode.OK, response, "application/json" );
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}