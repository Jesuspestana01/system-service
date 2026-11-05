const Home = () => {
  return (
    <>
      <div
        className="container shadow py-3 rounded-5 bg-body-tertiary"
        style={{ marginTop: "15rem" }}
      >
        <div className="row">
          <div className="col text-center">
            <h1 className="fw-bold">¡Bienvenidos a React con Layouts!</h1>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col text-center">
            <h3>Aqui puedes ir a la vista /login</h3>
            <div className="d-flex justify-content-center">
              <a href="/login" className="btn btn-outline-danger">
                Vista Login
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col d-flex justify-content-center">
          <img src="https://media.tenor.com/WFfC7L_kNCMAAAAj/starbound-poptop.gif" />
        </div>
      </div>
    </>
  );
};

export default Home;