---
title: Gateway pattern for external service calls
date: 2026-04-13T00:00:00.000Z
description: >-
  Separate business logic from external service calls using the Gateway pattern.
  Apply dependency inversion and interface segregation in Go.
tags:
  - Go
  - Distributed Systems
  - Design Patterns
aliases:
  - /go/gateway_pattern/
discussions: []
mermaid: false
type_label: ''
ogImage: site-cover.png
atUri: 'at://did:plc:miwiepbo3e3sh5fknyt7jxqm/site.standard.document/3mtvs662hyt2p'
---

No matter which language you're writing your service in, it's generally a good idea to
separate your external dependencies from your business-domain logic. Let's say your _order
service_ needs to make an RPC call to an external _payment service_ like Paypal when a
customer places an order.

Usually in Go, people make a package called `external` or `http` and stash the logic of
communicating with external services there. Then the business logic depends on the
`external` package to invoke the RPC call. This is already better than directly making RPC
calls inside your service functions, as that would make these two separate concerns
(business logic and external-service wrangling) tightly coupled. Testing these concerns in
isolation, therefore, would be a lot harder.

While this is a fairly common practice, I was looking for a canonical name for this pattern
to talk about it in a less hand-wavy way. Turns out [Martin Fowler wrote a blog post] on it
a few moons ago, and he calls it the _Gateway pattern_. He explores the philosophy in more
detail and gives some examples in JS. However, I thought that Gophers could benefit from a
few examples to showcase how it translates to Go. Plus, I wanted to reify the following
axiom:

> High-level modules should not depend on low-level modules. Both should depend on
> abstractions. Abstractions should not depend on details. Details should depend on
> abstractions.
>
> -- Dependency inversion principle (D in SOLID), Uncle Bob

In this scenario, our business logic in the `order` package is the _high-level module_ and
`external` is the _low-level module_, as the latter concerns itself with transport details.
Inside `external`, we could communicate with the external dependencies via either HTTP or
gRPC. But that's an implementation detail and shouldn't make any difference to the
high-level `order` package.

`order` will communicate with `external` via a common interface. This is how we satisfy the
_"both should depend on abstractions"_ part of the ethos.

Our app layout looks like this:

```txt
yourapp/
├── cmd/                        # wire up the deps
│   └── main.go
├── order/                      # business logic in the service functions
│   ├── service.go
│   └── service_test.go
├── external/                   # code to communicate with external deps
│   └── paypal/
│       ├── gateway.go
│       ├── mock_gateway.go
│       └── gateway_test.go
└── go.mod / go.sum
```

Let's walk through the flow from the bottom up. Think about walking back from the edge to
the core, as in [Alistair Cockburn's Hexagonal Architecture] lingo where _edge_ represents
the transport logic and _core_ implies the business concerns.

The Paypal implementation lives in `external/paypal/gateway.go`. For simplicity's sake,
we're pretending to call the Paypal API over HTTP, but this could be a gRPC call to another
service.

```go
// external/paypal/gateway.go
package paypal

import "fmt"

type PaypalGateway struct {
    APIKey string
}

func NewPaypalGateway(apiKey string) *PaypalGateway {
    return &PaypalGateway{APIKey: apiKey}
}

// Handle all the details of making HTTP calls to the paypal service here.
func (s *PaypalGateway) Charge(
    amount int64, currency string, source string) (string, error) {
    fmt.Printf(
        "[Paypal] Charging %d %s to card %s\n",
        amount, currency, source,
    )
    return "txn_live_123", nil
}

// Make another HTTP call to the paypal service to perform a refund.
func (s *PaypalGateway) Refund(transactionID string) error {
    fmt.Printf("[Paypal] Refunding transaction %s\n", transactionID)
    return nil
}
```

Notice that the `Paypal` package handles the details of communicating with the paypal
endpoint, but it doesn't export any interface for the higher-level module to use. This is
intentional.

In Go, the general advice is that the [consumer should define the interface they want, not
the provider].

> Go interfaces generally belong in the package that uses values of the interface type, not
> the package that implements those values.
>
> -- Go code review comments

That gives the consumer full control over what it wants to depend on, and nothing more. You
don't accidentally couple your code to a bloated interface just because the implementation
provided one. You define exactly the shape you need and mock that in your tests.

> Clients should not be forced to depend on methods they do not use.
>
> -- Interface segregation principle (I in SOLID), Uncle Bob

So, in the `order` package, we define a tiny private interface that reflects the use case.

```go
// order/service.go
package order

// The order service only requires the Charge method of a payment gateway.
// So we define a tiny interface here on the consumer side rather
// than on the producer side
type paymentGateway interface {
    Charge(amount int64, currency string, source string) (string, error)
}

type Service struct {
    gateway paymentGateway
}

// Pass the paypal implementation of paymentGateway at runtime here.
func NewService(gateway paymentGateway) *Service {
    return &Service{gateway: gateway}
}

// In production, this calls .Charge on the paypal implementation.
// During tests, it calls .Charge on a mock gateway.
func (s *Service) Checkout(amount int64, source string) error {
    _, err := s.gateway.Charge(amount, "USD", source)
    return err
}
```

The order service doesn't know or care which implementation of the gateway it's using to
perform some action. It just knows it can call `Charge` on the provided gateway type. It
doesn't need to care about the `Refund` method on the paypal gateway implementation. Also,
the `paymentGateway` interface is bound to the `order` package, so we're not polluting the
API surface with a bunch of tiny interfaces.

Now, when testing the service logic, you just need to write a tiny mock implementation of
`paymentGateway` and pass it to `order.Service`. You don't need to reach into the
`external/paypal` package or wire up anything complicated. You can place the fake right next
to your service test. Since interface implementations in Go are implicitly satisfied,
everything just works without much fuss.

```go
// order/service_test.go
package order_test

import (
    "testing"
    "yourapp/order"
)

type mockGateway struct {
    calledAmount int64
    calledSource string
}

func (m *mockGateway) Charge(
    amount int64, currency, source string) (string, error) {
    m.calledAmount = amount
    m.calledSource = source
    return "txn_mock", nil
}

func TestCheckoutCallsCharge(t *testing.T) {
    mock := &mockGateway{}
    svc := order.NewService(mock)

    err := svc.Checkout(1000, "test_source_abc")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if mock.calledAmount != 1000 {
        t.Errorf("expected amount 1000, got %d", mock.calledAmount)
    }

    if mock.calledSource != "test_source_abc" {
        t.Errorf("want source test_source_abc, got %s",
            mock.calledSource)
    }
}
```

The test is focused only on what matters: Does the service call `Charge` with the correct
arguments? We're not testing paypal here. That's its own concern.

You can still write tests for the paypal client if you want. You'd do that in
`external/paypal/gateway_test.go`.

```go
// external/paypal/gateway_test.go
package paypal_test

import (
    "testing"
    "yourapp/external/paypal"
)

func TestPaypalGateway_Charge(t *testing.T) {
    gw := paypal.NewPaypalGateway("dummy-key")
    txn, err := gw.Charge(1000, "USD", "tok_abc")

    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if txn == "" {
        t.Fatal("expected transaction ID, got empty string")
    }
}
```

Finally, everything is wired together in `cmd/main.go`.

```go
// cmd/main.go
package main

import (
    "yourapp/external/paypal"
    "yourapp/order"
)

func main() {
    paypalGw := paypal.NewPaypalGateway("live-api-key")

    // Passing the real paypal gateway to the order service.
    orderSvc := order.NewService(paypalGw)

    _ = orderSvc.Checkout(5000, "tok_live_card_xyz")
}
```

---

It's also common to call gateways _"client."_ Some people prefer that name. However, I think
_client_ is way overloaded, which makes it hard to discuss the pattern clearly. There's the
HTTP client, the gRPC client, and then your own client that wraps these. It gets confusing
fast. I prefer _"gateway,"_ as Martin Fowler used in his original text.

In Go context, the core idea is that a service function uses a locally defined gateway
interface to communicate with external gateway providers. This way, the service and the
external providers are unaware of each other's existence and can be tested independently.

<!-- references -->
<!-- prettier-ignore-start -->

[martin fowler wrote a blog post]:
    https://martinfowler.com/articles/gateway-pattern.html

[alistair cockburn's hexagonal architecture]:
    https://alistair.cockburn.us/hexagonal-architecture

[consumer should define the interface they want, not the provider]:
    https://go.dev/wiki/CodeReviewComments#interfaces

<!-- prettier-ignore-end -->
